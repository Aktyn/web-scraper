import { useCallback, useContext, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  AccountCircleRounded,
  CheckRounded,
  CloseRounded,
  EventRounded,
  KeyRounded,
  LockRounded,
  SendRounded,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  CircularProgress,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  type Account,
  type Site,
  upsertAccountSchema,
  type UpsertAccountSchema,
} from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { UserDataContext } from '../../context/userDataContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { formatDate } from '../../utils'
import { NestedDrawer } from '../common/NestedDrawer'
import { DrawerToggle } from '../common/button/DrawerToggle'
import { ToggleIconButton } from '../common/button/ToggleIconButton'
import { UrlButton } from '../common/button/UrlButton'
import { FormInput } from '../form/FormInput'
import { FormJsonInput } from '../form/FormJsonInput'
import { SiteSelectForm } from '../site/SiteSelectForm'

interface AccountFormProps {
  account?: Account | null
  onSuccess: () => void
}

export const AccountForm = ({ account, onSuccess }: AccountFormProps) => {
  const { dataEncryptionPassword } = useContext(UserDataContext)

  const createAccountRequest = useApiRequest(window.electronAPI.createAccount)
  const updateAccountRequest = useApiRequest(window.electronAPI.updateAccount)
  const getSiteRequest = useApiRequest(window.electronAPI.getSite)

  const form = useForm({
    mode: 'onTouched',
    resolver: yupResolver(upsertAccountSchema),
    defaultValues: account
      ? {
          loginOrEmail: account.loginOrEmail,
          password: account.password,
          additionalCredentialsData: account.additionalCredentialsData,
          siteId: account.siteId,
        }
      : undefined,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [site, setSite] = useState<Site | null>(null)
  const [showSiteSelect, setShowSiteSelect] = useState(false)

  const siteId = form.watch('siteId')
  const accountId = account?.id

  useEffect(() => {
    if (!siteId) {
      setSite(null)
      return
    }

    getSiteRequest.submit(
      {
        onSuccess: setSite,
      },
      siteId,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId])

  const onSubmit = useCallback(
    (data: UpsertAccountSchema) => {
      if (!dataEncryptionPassword) {
        return
      }

      if (accountId) {
        updateAccountRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Account updated' })
              onSuccess()
            },
          },
          accountId,
          data,
          dataEncryptionPassword,
        )
      } else {
        createAccountRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Account created' })
              onSuccess()
            },
          },
          data,
          dataEncryptionPassword,
        )
      }
    },
    [accountId, createAccountRequest, dataEncryptionPassword, onSuccess, updateAccountRequest],
  )

  return (
    <>
      <NestedDrawer
        title="Select site for account"
        onClose={() => setShowSiteSelect(false)}
        open={showSiteSelect}
      >
        <SiteSelectForm
          site={site}
          onSelect={(site) => {
            setSite(site)
            form.setValue('siteId', site.id, { shouldValidate: true })
            setShowSiteSelect(false)
          }}
        />
      </NestedDrawer>
      <Stack
        flexGrow={1}
        justifyContent="space-between"
        p={2}
        spacing={2}
        overflow="auto"
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Stack spacing={2}>
          {account && <ReadonlyAccountFields account={account} />}
          <FormInput
            name="loginOrEmail"
            form={form}
            label="Login or email"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleRounded />
                </InputAdornment>
              ),
            }}
          />
          <FormInput
            name="password"
            form={form}
            label="Password"
            required
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyRounded />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormJsonInput name="additionalCredentialsData" form={form} label="Additional data" />
          {siteId ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              alignItems="center"
              justifyContent="space-between"
              columnGap={1}
            >
              <FormHelperText variant="standard" margin="dense" sx={{ width: '100%' }}>
                Site
              </FormHelperText>
              {site ? <UrlButton>{site.url}</UrlButton> : <CircularProgress size={24} />}
              <ToggleIconButton
                open={showSiteSelect}
                onToggle={setShowSiteSelect}
                closeTooltip="Select site"
                openTooltip="Close site select"
              />
            </Stack>
          ) : (
            <DrawerToggle open={showSiteSelect} onToggle={setShowSiteSelect}>
              Select site*
            </DrawerToggle>
          )}
          {form.formState.errors?.siteId && (
            <Typography variant="caption" color="error" textAlign="center">
              {form.formState.errors.siteId.message}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip
            title={
              dataEncryptionPassword === null
                ? 'Press the key icon in the top right corner to unlock this button'
                : undefined
            }
          >
            <Box>
              <LoadingButton
                variant="outlined"
                color="primary"
                type="submit"
                endIcon={dataEncryptionPassword === null ? <LockRounded /> : <SendRounded />}
                loading={createAccountRequest.submitting || updateAccountRequest.submitting}
                loadingPosition="end"
                disabled={dataEncryptionPassword === null}
              >
                {account ? 'Update' : 'Submit'}
              </LoadingButton>
            </Box>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  )
}

const ReadonlyAccountFields = ({ account }: { account: Account }) => {
  return (
    <>
      <TextField
        label="Created"
        value={formatDate(account.createdAt)}
        variant="standard"
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <EventRounded />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Last used"
        value={account.lastUsed ? formatDate(account.lastUsed) : '-'}
        variant="standard"
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <EventRounded />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Active"
        value={account.active ? 'Yes' : 'No'}
        variant="standard"
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              {account.active ? <CheckRounded /> : <CloseRounded />}
            </InputAdornment>
          ),
        }}
      />
    </>
  )
}
