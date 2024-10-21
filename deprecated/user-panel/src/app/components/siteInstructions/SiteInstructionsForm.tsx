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
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { ScraperTestingSessionsModule } from '../../modules/ScraperTestingSessionsModule'
import { formatDate } from '../../utils'
import { UrlButton } from '../common/button/UrlButton'

interface SiteInstructionsFormProps {
  site: Site
  onSuccess: () => void
}

export const SiteInstructionsForm = ({ site, onSuccess }: SiteInstructionsFormProps) => {
  const { submit: getSiteInstructions, submitting: gettingSiteInstructions } = useApiRequest(
    window.electronAPI.getSiteInstructions,
  )
  const { submit: setSiteInstructions, submitting: settingSiteInstructions } = useApiRequest(
    window.electronAPI.setSiteInstructions,
  )
  const { submit: pickElement } = useApiRequest(window.electronAPI.pickElement)
  const { submit: cancelPickingElement } = useApiRequest(window.electronAPI.cancelPickingElement)

  const testingSessions = ScraperTestingSessionsModule.useTestingSessions()
  const siteTestingSession = testingSessions.sessions.find((session) => session.site.id === site.id)
  const sessionId = siteTestingSession?.sessionId

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
          resetForm(pick(instructions, 'procedures', 'actions') as never)
          setInstructions(instructions)
        },
        onError: (error, { showErrorSnackbar }) => {
          if (error.errorCode === ErrorCode.NOT_FOUND) {
            setInstructions(null)
            resetForm()
          } else {
            showErrorSnackbar()
          }
        },
      },
      site.id,
    )
  }, [getSiteInstructions, resetForm, site.id])

  const onSubmit = useCallback(
    (data: UpsertSiteInstructionsSchema) => {
      setSiteInstructions(
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
    [onSuccess, setSiteInstructions, site.id],
  )

  const handlePickElement = useCallback(async () => {
    if (!sessionId) {
      return Promise.resolve('')
    }

    return new Promise<string | null>((resolve) => {
      pickElement(
        {
          onSuccess: (elementData) => {
            resolve(elementData.jsPath)
          },
          onError: (error, { showErrorSnackbar }) => {
            if (error.errorCode !== ErrorCode.NO_ERROR) {
              showErrorSnackbar()
            }
            resolve(null)
          },
        },
        sessionId,
      )
    })
  }, [pickElement, sessionId])

  const handleCancelPickingElement = useCallback(() => {
    if (!sessionId) {
      return
    }

    cancelPickingElement({}, sessionId)
  }, [cancelPickingElement, sessionId])

  return (
    <FormProvider {...form}>
      <SiteInstructionsTestingSessionContext.Provider
        value={
          siteTestingSession
            ? {
                testingSession: siteTestingSession,
                pickElement: handlePickElement,
                cancelPickingElement: handleCancelPickingElement,
              }
            : null
        }
      >
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
                  gap: '2rem',
                  py: '0.5rem',
                  px: '1rem',
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
                  overflowY: 'hidden',
                  overflowX: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1px auto',
                  gridTemplateRows: '100%',
                  justifyContent: 'stretch',
                  alignItems: 'stretch',
                  gap: 0,
                }}
              >
                <Stack
                  flexGrow={1}
                  justifyContent="flex-start"
                  overflow="auto"
                  minWidth="30rem"
                  sx={{ scrollBehavior: 'smooth' }}
                >
                  <ProceduresForm />
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack
                  flexGrow={1}
                  justifyContent="flex-start"
                  overflow="auto"
                  minWidth="30rem"
                  sx={{ scrollBehavior: 'smooth' }}
                >
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
            p="1rem"
            gap="1rem"
          >
            <LoadingButton
              variant="outlined"
              color="primary"
              endIcon={<EngineeringRounded />}
              loading={
                (testingSessions.startingSession &&
                  testingSessions.startingSessionData?.[0] === site.id) ||
                (testingSessions.endingSession &&
                  testingSessions.endingSessionData?.[0] === sessionId)
              }
              loadingPosition="end"
              onClick={() =>
                siteTestingSession
                  ? testingSessions.endSession(siteTestingSession)
                  : testingSessions.startSession(site.id)
              }
            >
              {siteTestingSession ? 'End testing session' : 'Start testing session'}
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              color="primary"
              type="submit"
              endIcon={<SendRounded />}
              loading={settingSiteInstructions}
              loadingPosition="end"
            >
              Apply changes
            </LoadingButton>
          </Stack>
        </Stack>
      </SiteInstructionsTestingSessionContext.Provider>
    </FormProvider>
  )
}
