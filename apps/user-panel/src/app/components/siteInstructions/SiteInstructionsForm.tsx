import { useCallback, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { EventRounded, LinkRounded, SendRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
} from '@mui/material'
import {
  ErrorCode,
  pick,
  type Site,
  type SiteInstructions,
  type UpsertSiteInstructionsSchema,
  upsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { FormProvider, useForm } from 'react-hook-form'
import { ActionsForm } from './ActionsForm'
import { ProceduresForm } from './ProceduresForm'
import { useApiRequest } from '../../hooks/useApiRequest'
import { errorLabels, formatDate } from '../../utils'
import { UrlButton } from '../common/button/UrlButton'

interface SiteInstructionsFormProps {
  site: Site
  onSuccess: () => void
}

export const SiteInstructionsForm = ({ site, onSuccess }: SiteInstructionsFormProps) => {
  const getSiteInstructionsRequest = useApiRequest(window.electronAPI.getSiteInstructions)
  const setSiteInstructionsRequest = useApiRequest(window.electronAPI.setSiteInstructions)

  const form = useForm<UpsertSiteInstructionsSchema>({
    mode: 'onTouched',
    resolver: yupResolver(upsertSiteInstructionsSchema),
  })

  const [instructions, setInstructions] = useState<SiteInstructions | null>(null)

  useEffect(() => {
    getSiteInstructionsRequest.submit(
      {
        onSuccess: (instructions) => {
          form.reset(pick(instructions, 'procedures', 'actions'))
          setInstructions(instructions)
        },
        onError: (error, { enqueueSnackbar }) => {
          if (error.errorCode === ErrorCode.NOT_FOUND) {
            setInstructions(null)
            form.reset()
          } else {
            enqueueSnackbar({ variant: 'error', message: errorLabels[error.errorCode] })
          }
        },
      },
      site.id,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site])

  const onSubmit = useCallback(
    (data: UpsertSiteInstructionsSchema) => {
      setSiteInstructionsRequest.submit(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'success', message: 'Site instructions set successfully' })
            onSuccess()
          },
        },
        site.id,
        data,
      )
    },
    [onSuccess, setSiteInstructionsRequest, site.id],
  )

  return (
    <FormProvider {...form}>
      <Stack
        flexGrow={1}
        overflow="hidden"
        minWidth="32rem"
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {!getSiteInstructionsRequest.submitting && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: instructions ? '1fr 1fr' : 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                py: 1,
              }}
            >
              <FormControl sx={{ justifySelf: 'flex-end' }}>
                <InputLabel variant="standard" margin="dense" shrink>
                  Url
                </InputLabel>
                <Stack direction="row" alignItems="center" spacing={1} mt="1rem" minHeight="2rem">
                  <LinkRounded />
                  <UrlButton width="100%" maxWidth="16rem" justifyContent="flex-start">
                    {site.url}
                  </UrlButton>
                </Stack>
              </FormControl>
              {instructions && (
                <TextField
                  label="Created"
                  value={formatDate(instructions.createdAt)}
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
              )}
            </Box>
            <Divider />
          </>
        )}
        <Stack
          flexGrow={1}
          alignItems="stretch"
          justifyContent="stretch"
          sx={{
            overflowY: 'hidden',
            overflowX: 'auto',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          {getSiteInstructionsRequest.submitting ? (
            <CircularProgress color="primary" size="2rem" sx={{ mx: 'auto', my: 2 }} />
          ) : (
            <Box
              key={instructions?.id || 'instructions'}
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'auto 1px auto',
                gridTemplateRows: '100%',
                justifyContent: 'center',
                alignItems: 'stretch',
                gap: 0,
              }}
            >
              <Stack flexGrow={1} justifyContent="flex-start" overflow="auto">
                <ProceduresForm />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack flexGrow={1} justifyContent="flex-start" overflow="auto">
                <ActionsForm />
              </Stack>
            </Box>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center" py={2}>
          <LoadingButton
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<SendRounded />}
            loading={setSiteInstructionsRequest.submitting}
            loadingPosition="end"
          >
            Apply
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  )
}
