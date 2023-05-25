import { useContext, useEffect, type DependencyList } from 'react'
import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
import type { ApiEventListenerType } from '../context/apiContext'
import { ApiContext } from '../context/apiContext'

export function useApiEvent<MessageType extends ElectronToRendererMessage>(
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
