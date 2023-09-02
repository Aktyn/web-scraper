import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type DependencyList,
  type PropsWithChildren,
} from 'react'
import { ElectronToRendererMessage, type ElectronApi } from '@web-scraper/common'

import { noop } from '../utils'
import { scraperExecutionScopeNames } from '../utils/dictionaries'

export type ApiEventListenerType = <MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: Parameters<Parameters<ElectronApi[MessageType]>[0]>
) => void

const ApiContext = createContext({
  addEventsListener: noop as (listener: ApiEventListenerType) => void,
  removeEventsListener: noop as (listener: ApiEventListenerType) => void,
})

const ApiProvider = ({ children }: PropsWithChildren) => {
  const listenersRef = useRef(new Set<ApiEventListenerType>())

  const addEventsListener = useCallback(
    (listener: ApiEventListenerType) => listenersRef.current.add(listener),
    [],
  )
  const removeEventsListener = useCallback(
    (listener: ApiEventListenerType) => listenersRef.current.delete(listener),
    [],
  )

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
      [ElectronToRendererMessage.windowStateChanged]: (_, stateChange) => {
        console.info(`Window state changed: ${stateChange}`)
      },
      [ElectronToRendererMessage.siteInstructionsTestingSessionOpen]: (_, sessionId, site) => {
        console.info(
          `Site instructions testing session open (id: ${sessionId}; site url: ${site.url})`,
        )
      },
      [ElectronToRendererMessage.siteInstructionsTestingSessionClosed]: (_, sessionId) => {
        console.info(`Site instructions testing session closed (id: ${sessionId})`)
      },
      [ElectronToRendererMessage.scraperExecutionStarted]: (
        _,
        scraperId,
        mode,
        _executionId,
        data,
      ) => {
        console.info(
          `Scraper execution started (id: ${scraperId}; mode: ${mode}; scope: ${
            scraperExecutionScopeNames[data.scope]
          })`,
        )
      },
      [ElectronToRendererMessage.scraperExecutionResult]: (
        _,
        scraperId,
        mode,
        _executionId,
        data,
      ) => {
        console.info(
          `Scraper execution returned some result (id: ${scraperId}; mode: ${mode}; scope: ${
            scraperExecutionScopeNames[data.scope]
          })`,
        )
      },
      [ElectronToRendererMessage.scraperExecutionFinished]: (
        _,
        scraperId,
        mode,
        _executionId,
        data,
      ) => {
        console.info(
          `Scraper execution finished (id: ${scraperId}; mode: ${mode}; scope: ${
            scraperExecutionScopeNames[data.scope]
          })`,
        )
      },
      [ElectronToRendererMessage.requestManualDataForActionStep]: (_, requestId, actionStep) => {
        console.info(
          `Manual data requested for action step (id: ${requestId}; step type: ${actionStep.type})`,
        )
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
    <ApiContext.Provider value={{ addEventsListener, removeEventsListener }}>
      {children}
    </ApiContext.Provider>
  )
}

function useEvent<MessageType extends ElectronToRendererMessage>(
  eventName: MessageType,
  callback: Parameters<ElectronApi[MessageType]>[0],
  deps: DependencyList = [],
) {
  const apiEventContext = useContext(ApiContext)

  useEffect(() => {
    const handleApiEvent = (message: MessageType, ...args: Parameters<typeof callback>) => {
      if (message === eventName) {
        ;(callback as (...args: Parameters<typeof callback>) => void)(...args)
      }
    }

    apiEventContext.addEventsListener(handleApiEvent as ApiEventListenerType)

    return () => {
      apiEventContext.removeEventsListener(handleApiEvent as ApiEventListenerType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...deps])
}

export const ApiModule = {
  Provider: ApiProvider,
  useEvent,
}
