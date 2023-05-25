import { useCallback, useMemo, useState } from 'react'
import { ElectronToRendererMessage, type Site } from '@web-scraper/common'
import { useApiEvent } from './useApiEvent'
import { useApiRequest } from './useApiRequest'
import { errorLabels } from '../utils'

export function useSiteInstructionsTestingSession() {
  const { submit: startSiteInstructionsTestingSession, submitting: startingSession } =
    useApiRequest(window.electronAPI.startSiteInstructionsTestingSession)

  const [sessionId, setSessionId] = useState<string | null>(null)

  useApiEvent(
    ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
    (event, sessionId) => {
      if (sessionId === sessionId) {
        setSessionId(null)
      }
      //! event.sender.send('responseEvent', 1)
    },
    [sessionId],
  )

  const startSession = useCallback(
    (siteId: Site['id']) => {
      startSiteInstructionsTestingSession(
        {
          onSuccess: (data, { enqueueSnackbar }) => {
            // eslint-disable-next-line no-console
            console.log('Site instructions testing session started with id:', data.sessionId)
            setSessionId(data.sessionId)
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

  return useMemo(
    () => ({
      startSession,
      startingSession,
      sessionId,
    }),
    [sessionId, startSession, startingSession],
  )
}
