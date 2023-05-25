import { useCallback, useEffect, useRef, type PropsWithChildren } from 'react'
import { ElectronToRendererMessage } from '@web-scraper/common'
import { ApiEventsContext, type EventListenerType } from '../context/apiEventsContext'

export const ApiEventsProvider = ({ children }: PropsWithChildren) => {
  const listenersRef = useRef(new Set<EventListenerType>())

  const addEventsListener = useCallback((listener: EventListenerType) => {
    listenersRef.current.add(listener)
  }, [])

  const removeEventsListener = useCallback((listener: EventListenerType) => {
    listenersRef.current.delete(listener)
  }, [])

  useEffect(() => {
    let mounted = true

    window.electronAPI.siteInstructionsTestingSessionClosed((...args) => {
      if (!mounted) {
        return
      }
      listenersRef.current.forEach((listener) =>
        listener(ElectronToRendererMessage.siteInstructionsTestingSessionClosed, ...args),
      )
    })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <ApiEventsContext.Provider value={{ addEventsListener, removeEventsListener }}>
      {children}
    </ApiEventsContext.Provider>
  )
}
