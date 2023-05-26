import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react'
import type { ElectronApi } from '@web-scraper/common'
import { ElectronToRendererMessage } from '@web-scraper/common'
import { useTestingSessions } from './useTestingSessions'
import type { ApiEventListenerType } from '../context/apiContext'
import { ApiContext } from '../context/apiContext'

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
        testingSessions.setSessions((sessions) => [...sessions, { sessionId, site }])
      },
    )
    registerEvent(
      ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
      (_, sessionId) => {
        console.info(`Site instructions testing session closed (id: ${sessionId})`)
        testingSessions.setSessions((sessions) =>
          sessions.filter((session) => session.sessionId !== sessionId),
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
