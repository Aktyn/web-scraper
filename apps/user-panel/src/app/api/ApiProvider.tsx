import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import type { ElectronApi, Site } from '@web-scraper/common'
import { ElectronToRendererMessage } from '@web-scraper/common'
import type { ApiEventListenerType } from '../context/apiContext'
import { ApiContext } from '../context/apiContext'
import { useApiRequest } from '../hooks/useApiRequest'
import { errorLabels } from '../utils'

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const listenersRef = useRef(new Set<ApiEventListenerType>())

  const addEventsListener = useCallback(
    (listener: ApiEventListenerType) => listenersRef.current.add(listener),
    [],
  )
  const removeEventsListener = useCallback(
    (listener: ApiEventListenerType) => listenersRef.current.delete(listener),
    [],
  )

  const testingSessions = useTestingSessions()

  useEffect(() => {
    let mounted = true

    const registerEvent = <MessageType extends ElectronToRendererMessage>(
      type: MessageType,
      callback: (...args: Parameters<Parameters<ElectronApi[MessageType]>[0]>) => void,
    ) => {
      window.electronAPI[type]((...args) => {
        if (!mounted) {
          return
        }
        callback(...(args as Parameters<Parameters<ElectronApi[MessageType]>[0]>))

        listenersRef.current.forEach((listener) =>
          listener(type, ...(args as Parameters<Parameters<ElectronApi[MessageType]>[0]>)),
        )
      })
    }

    registerEvent(
      ElectronToRendererMessage.siteInstructionsTestingSessionOpen,
      (_, sessionId, site) => {
        console.info(
          `Site instructions testing session open (id: ${sessionId}; site url: ${site.url})`,
        )
        testingSessions.setSessions((sessions) => [...sessions, { id: sessionId, site }])
      },
    )
    registerEvent(
      ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
      (_, sessionId) => {
        console.info(`Site instructions testing session closed (id: ${sessionId})`)
        testingSessions.setSessions((sessions) =>
          sessions.filter((session) => session.id !== sessionId),
        )
      },
    )

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ApiContext.Provider value={{ addEventsListener, removeEventsListener, testingSessions }}>
      {children}
    </ApiContext.Provider>
  )
}

interface TestingSessionSchema {
  id: string
  site: Site
}

export type TestingSessionsContext = ReturnType<typeof useTestingSessions>

function useTestingSessions() {
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
    (sessionId: string) => {
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
        sessionId,
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
