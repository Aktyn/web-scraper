import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Site } from '@web-scraper/common'
import { useApiRequest } from '../hooks/useApiRequest'
import { errorLabels } from '../utils'

export interface TestingSessionSchema {
  sessionId: string
  site: Site
}

export type TestingSessionsContext = ReturnType<typeof useTestingSessions>

export function useTestingSessions() {
  const { submit: getSiteInstructionsTestingSessions } = useApiRequest(
    window.electronAPI.getSiteInstructionsTestingSessions,
  )
  const {
    submit: startSiteInstructionsTestingSession,
    submitting: startingSession,
    submittingData: startingSessionData,
  } = useApiRequest(window.electronAPI.startSiteInstructionsTestingSession)
  const {
    submit: endSiteInstructionsTestingSession,
    submitting: endingSession,
    submittingData: endingSessionData,
  } = useApiRequest(window.electronAPI.endSiteInstructionsTestingSession)

  const [testingSessions, setTestingSessions] = useState<TestingSessionSchema[]>([])

  useEffect(() => {
    getSiteInstructionsTestingSessions({
      onSuccess: setTestingSessions,
    })
  }, [getSiteInstructionsTestingSessions])

  const startSession = useCallback(
    (siteId: Site['id']) => {
      startSiteInstructionsTestingSession(
        {
          onSuccess: (data, { enqueueSnackbar }) => {
            enqueueSnackbar({
              variant: 'success',
              message: 'Site instructions testing session started',
            })
          },
          onError: (error, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'error', message: errorLabels[error.errorCode] })
          },
        },
        siteId,
      )
    },
    [startSiteInstructionsTestingSession],
  )

  const endSession = useCallback(
    (session: TestingSessionSchema | string) => {
      endSiteInstructionsTestingSession(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({
              variant: 'success',
              message: 'Site instructions testing session ended',
            })
          },
          onError: (error, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'error', message: errorLabels[error.errorCode] })
          },
        },
        typeof session === 'string' ? session : session.sessionId,
      )
    },
    [endSiteInstructionsTestingSession],
  )

  return useMemo(
    () => ({
      startSession,
      endSession,
      sessions: testingSessions,
      setSessions: setTestingSessions,
      startingSession,
      startingSessionData,
      endingSession,
      endingSessionData,
    }),
    [
      endSession,
      endingSession,
      endingSessionData,
      startSession,
      startingSession,
      startingSessionData,
      testingSessions,
    ],
  )
}
