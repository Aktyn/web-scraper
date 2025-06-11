import { useStateToRef } from "@/hooks/useStateToRef"
import { api } from "@/lib/api"
import {
  type SubscriptionMessage,
  subscriptionMessageSchema,
  SubscriptionMessageType,
} from "@web-scraper/common"
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

enum ConnectionStatus {
  Connecting = "connecting",
  Open = "open",
  Error = "error",
}

type AnyMessageListener = (message: SubscriptionMessage) => void
type GenericMessageListenerRegister = <Type extends SubscriptionMessageType>(
  messageType: Type,
  callback: (message: Extract<SubscriptionMessage, { type: Type }>) => void,
) => void

const ServerEventsContext = createContext({
  status: ConnectionStatus.Connecting,
  registerMessageListener: (() => {}) as GenericMessageListenerRegister,
  unregisterMessageListener: (() => {}) as GenericMessageListenerRegister,
})

export function ServerEventsProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState(ConnectionStatus.Connecting)

  const messageListeners = useRef(
    new Map<SubscriptionMessageType, AnyMessageListener[]>(),
  )

  const handleMessage = useCallback((message: SubscriptionMessage) => {
    switch (message.type) {
      case SubscriptionMessageType.SubscriptionInitialized:
        console.info("SSE connection initialized")
        break
      case SubscriptionMessageType.ScraperEvent:
        // if (message.event.type === ScraperEventType.AllExecutionsFinished) {
        //   //TODO: show toast about notification after implementing notification system
        //   toast.info("Scraper finished all executions", {
        //     description: `Number of iterations: ${message.event.iterations}`,
        //   })
        // }

        // noop
        break
      case SubscriptionMessageType.Notification:
        // TODO: show toast
        break
      default:
        console.warn(
          "Unknown message type:",
          (message as SubscriptionMessage).type,
        )
        return
    }

    messageListeners.current
      .get(message.type)
      ?.forEach((listener) => listener(message))
  }, [])

  const registerMessageListener = useCallback<GenericMessageListenerRegister>(
    (messageType, listener) => {
      if (!messageListeners.current.has(messageType)) {
        messageListeners.current.set(messageType, [])
      }
      messageListeners.current
        .get(messageType)!
        .push(listener as AnyMessageListener)
    },
    [],
  )
  const unregisterMessageListener = useCallback<GenericMessageListenerRegister>(
    (messageType, listener) => {
      if (messageListeners.current.has(messageType)) {
        const listeners = messageListeners.current.get(messageType)
        if (listeners) {
          messageListeners.current.set(
            messageType,
            listeners.filter((l) => l !== listener),
          )
        }
      }
    },
    [],
  )

  useEffect(() => {
    const sseUrl = `${api.baseUrl}/subscribe`
    const eventSource = new EventSource(sseUrl)

    eventSource.onopen = () => setStatus(ConnectionStatus.Open)

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error)
      setStatus(ConnectionStatus.Error)
    }

    eventSource.addEventListener("subscription-message", (event) => {
      try {
        const message = subscriptionMessageSchema.parse(JSON.parse(event.data))
        handleMessage(message)
      } catch (error) {
        console.error("Error parsing subscription message:", error)
      }
    })

    return () => {
      eventSource.close()
    }
  }, [handleMessage])

  return (
    <ServerEventsContext
      value={{ status, registerMessageListener, unregisterMessageListener }}
    >
      {children}
    </ServerEventsContext>
  )
}

const useServerEvents = () => {
  return useContext(ServerEventsContext)
}

const useServerEventMessages: GenericMessageListenerRegister = (
  messageType,
  callback,
) => {
  const { registerMessageListener, unregisterMessageListener } =
    useServerEvents()

  const callbackRef = useStateToRef(callback)
  useEffect(() => {
    const callback = callbackRef.current
    if (!callback) {
      console.warn("No callback provided for message type:", messageType)
      return
    }

    registerMessageListener(messageType, callback)

    return () => unregisterMessageListener(messageType, callback)
  }, [
    messageType,
    callbackRef,
    registerMessageListener,
    unregisterMessageListener,
  ])
}

ServerEventsProvider.useContext = useServerEvents
ServerEventsProvider.useMessages = useServerEventMessages
ServerEventsProvider.ConnectionStatus = ConnectionStatus
ServerEventsProvider.displayName = "ServerEventsProvider"
