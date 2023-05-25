import { useCallback, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { EngineeringRounded, EventRounded, LinkRounded, SendRounded } from '@mui/icons-material'
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
  upsertSiteInstructionsSchema,
  type Site,
  type SiteInstructions,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { FormProvider, useForm } from 'react-hook-form'
import { ActionsForm } from './ActionsForm'
import { ProceduresForm } from './ProceduresForm'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useSiteInstructionsTestingSession } from '../../hooks/useSiteInstructionsTestingSession'
import { errorLabels, formatDate } from '../../utils'
import { UrlButton } from '../common/button/UrlButton'

interface SiteInstructionsFormProps {
  site: Site
  onSuccess: () => void
}

export const SiteInstructionsForm = ({ site, onSuccess }: SiteInstructionsFormProps) => {
  const { submit: getSiteInstructions, submitting: gettingSiteInstructions } = useApiRequest(
    window.electronAPI.getSiteInstructions,
  )
  const setSiteInstructionsRequest = useApiRequest(window.electronAPI.setSiteInstructions)

  const testingSession = useSiteInstructionsTestingSession()

  const form = useForm<UpsertSiteInstructionsSchema>({
    mode: 'onTouched',
    resolver: yupResolver(upsertSiteInstructionsSchema),
  })
  const resetForm = form.reset

  const [instructions, setInstructions] = useState<SiteInstructions | null>(null)

  useEffect(() => {
    getSiteInstructions(
      {
        onSuccess: (instructions) => {
          resetForm(pick(instructions, 'procedures', 'actions'))
          setInstructions(instructions)
        },
        onError: (error, { enqueueSnackbar }) => {
          if (error.errorCode === ErrorCode.NOT_FOUND) {
            setInstructions(null)
            resetForm()
          } else {
            enqueueSnackbar({ variant: 'error', message: errorLabels[error.errorCode] })
          }
        },
      },
      site.id,
    )
  }, [getSiteInstructions, resetForm, site.id])

  const onSubmit = useCallback(
    (data: UpsertSiteInstructionsSchema) => {
      setSiteInstructionsRequest.submit(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({
              variant: 'success',
              message:
                data.actions.length || data.procedures.length
                  ? 'Site instructions set successfully'
                  : 'Site instructions removed successfully',
            })
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
        {!gettingSiteInstructions && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: instructions ? '1fr 1fr' : 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                py: 1,
                px: 2,
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
          {gettingSiteInstructions ? (
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
                justifyContent: 'stretch',
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
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          gap={2}
        >
          <LoadingButton
            variant="outlined"
            color="primary"
            endIcon={<EngineeringRounded />}
            loading={testingSession.startingSession}
            loadingPosition="end"
            onClick={() =>
              testingSession.sessionId
                ? () => {
                    //TODO: stop session
                  }
                : testingSession.startSession(site.id)
            }
          >
            {testingSession.sessionId ? 'End testing session' : 'Start testing session'}
          </LoadingButton>
          <LoadingButton
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<SendRounded />}
            loading={setSiteInstructionsRequest.submitting}
            loadingPosition="end"
          >
            Apply changes
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  )
}
