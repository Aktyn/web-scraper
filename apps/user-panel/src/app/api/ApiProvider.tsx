import { useCallback, useEffect, useRef, type PropsWithChildren, useState } from 'react'
import type { ActionStep, ElectronApi } from '@web-scraper/common'
import { ElectronToRendererMessage } from '@web-scraper/common'
import { useTestingSessions } from './useTestingSessions'
import { ManualDataForActionStepDialog } from '../components/siteInstructions/ManualDataForActionStepDialog'
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

  const [manualDataForActionStepResponseQueue, setManualDataForActionStepResponseQueue] = useState<
    {
      requestId: string
      actionStep: ActionStep
      valueQuery: string
    }[]
  >([])

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

    const eventsHandlers: {
      [key in ElectronToRendererMessage]: (
        ...args: Parameters<Parameters<ElectronApi[key]>[0]>
      ) => void
    } = {
      [ElectronToRendererMessage.siteInstructionsTestingSessionOpen]: (_, sessionId, site) => {
        console.info(
          `Site instructions testing session open (id: ${sessionId}; site url: ${site.url})`,
        )
        testingSessions.setSessions((sessions) => [...sessions, { sessionId, site }])
      },
      [ElectronToRendererMessage.siteInstructionsTestingSessionClosed]: (_, sessionId) => {
        console.info(`Site instructions testing session closed (id: ${sessionId})`)
        testingSessions.setSessions((sessions) =>
          sessions.filter((session) => session.sessionId !== sessionId),
        )
      },
      [ElectronToRendererMessage.requestManualDataForActionStep]: (
        _,
        requestId,
        actionStep,
        valueQuery,
      ) => {
        console.info(
          `Manual data requested for action step (id: ${requestId}; step type: ${actionStep.type})`,
        )
        setManualDataForActionStepResponseQueue((queue) => [
          ...queue,
          { requestId, actionStep, valueQuery },
        ])
      },
    }

    for (const key in eventsHandlers) {
      registerEvent(key as ElectronToRendererMessage, eventsHandlers[key as never])
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ApiContext.Provider value={{ addEventsListener, removeEventsListener, testingSessions }}>
      {children}
      <ManualDataForActionStepDialog
        open={manualDataForActionStepResponseQueue.length > 0}
        data={manualDataForActionStepResponseQueue.at(0)}
        onResponseSent={(handledData) =>
          setManualDataForActionStepResponseQueue((queue) =>
            queue.filter((item) => item !== handledData),
          )
        }
      />
    </ApiContext.Provider>
  )
}
