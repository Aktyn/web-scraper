import { useContext, useEffect, type DependencyList } from 'react'
import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
import type { EventListenerType } from '../context/apiEventsContext'
import { ApiEventsContext } from '../context/apiEventsContext'

export function useApiEvent<MessageType extends ElectronToRendererMessage>(
  eventName: MessageType,
  callback: Parameters<ElectronApi[MessageType]>[0],
  deps: DependencyList = [],
) {
  const apiEventContext = useContext(ApiEventsContext)

  useEffect(() => {
    const handleApiEvent = (message: MessageType, ...args: Parameters<typeof callback>) => {
      if (message === eventName) {
        ;(callback as (...args: Parameters<typeof callback>) => void)(...args)
      }
    }

    apiEventContext.addEventsListener(handleApiEvent as EventListenerType)

    return () => {
      apiEventContext.removeEventsListener(handleApiEvent as EventListenerType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...deps])
}
