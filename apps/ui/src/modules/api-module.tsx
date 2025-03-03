import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react'
import { ElectronToRendererMessage, type ElectronApi } from '@web-scraper/common'

import { noop } from '~/lib/utils'

export type ApiEventListenerType = <MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: Parameters<Parameters<ElectronApi[MessageType]>[0]>
) => void

const ApiContext = createContext({
  addEventsListener: noop as (listener: ApiEventListenerType) => void,
  removeEventsListener: noop as (listener: ApiEventListenerType) => void,
})

// eslint-disable-next-line react-refresh/only-export-components
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
      // [ElectronToRendererMessage.routineExecutionStarted]: (_, executionId, routine) => {
      //   console.info(`Routine execution started (id: ${executionId}; routine: ${routine.name})`)
      // },
      // [ElectronToRendererMessage.routineExecutionResult]: (_, executionId, results) => {
      //   console.info(
      //     `Routine execution results (execution id: ${executionId}; routine: ${results.routine.name})`,
      //   )
      // },
      // [ElectronToRendererMessage.routineExecutionFinished]: (_, executionId) => {
      //   console.info(`Routine execution finished (id: ${executionId})`)
      // },
      // [ElectronToRendererMessage.scraperExecutionStarted]: (
      //   _,
      //   scraperId,
      //   mode,
      //   _executionId,
      //   _data,
      // ) => {
      //   console.info(
      //     `Scraper execution started (id: ${scraperId}; mode: ${mode}; scope: ${
      //       '' // scraperExecutionScopeNames[data.scope] //TODO: implement
      //     })`,
      //   )
      // },
      // [ElectronToRendererMessage.scraperExecutionResult]: (
      //   _,
      //   scraperId,
      //   mode,
      //   _executionId,
      //   _data,
      // ) => {
      //   console.info(
      //     `Scraper execution returned some result (id: ${scraperId}; mode: ${mode}; scope: ${
      //       '' // scraperExecutionScopeNames[data.scope] //TODO: implement
      //     })`,
      //   )
      // },
      // [ElectronToRendererMessage.scraperExecutionFinished]: (
      //   _,
      //   scraperId,
      //   mode,
      //   _executionId,
      //   _data,
      // ) => {
      //   console.info(
      //     `Scraper execution finished (id: ${scraperId}; mode: ${mode}; scope: ${
      //       '' // scraperExecutionScopeNames[data.scope] //TODO: implement
      //     })`,
      //   )
      // },
      // [ElectronToRendererMessage.requestManualDataForActionStep]: (
      //   _,
      //   requestId,
      //   actionStep,
      //   valueQuery,
      // ) => {
      //   console.info(
      //     `Manual data requested for action step (id: ${requestId}; step type: ${actionStep.type}; value query: ${valueQuery})`,
      //   )
      // },
      // [ElectronToRendererMessage.requestDataSourceItemIdForActionStep]: (
      //   _,
      //   requestId,
      //   actionStep,
      //   dataSourceQuery,
      // ) => {
      //   console.info(
      //     `Manual data requested for action step (id: ${requestId}; step type: ${actionStep.type}; data source query: ${dataSourceQuery})`,
      //   )
      // },
    }

    for (const key in eventsHandlers) {
      registerEvent(key as ElectronToRendererMessage, eventsHandlers[key as never])
    }

    return () => {
      mounted = false
    }
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
  }, [apiEventContext, callback, eventName])
}

export const ApiModule = {
  Provider: ApiProvider,
  useEvent,
}
