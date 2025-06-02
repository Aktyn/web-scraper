import { api } from "@/lib/api"
import {
  type SubscriptionMessage,
  subscriptionMessageSchema,
  SubscriptionMessageType,
} from "@web-scraper/common"
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
  useEffect,
  useCallback,
} from "react"

enum ConnectionStatus {
  Connecting = "connecting",
  Open = "open",
  Error = "error",
}

interface ServerEventsContextValue {
  status: ConnectionStatus
}

const ServerEventsContext = createContext<ServerEventsContextValue>({
  status: ConnectionStatus.Connecting,
})

export function ServerEventsProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState(ConnectionStatus.Connecting)

  const handleMessage = useCallback((message: SubscriptionMessage) => {
    switch (message.type) {
      case SubscriptionMessageType.SubscriptionInitialized:
        console.info("SSE connection initialized")
        break
    }
  }, [])

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
    <ServerEventsContext value={{ status }}>{children}</ServerEventsContext>
  )
}

export function useServerEvents() {
  return useContext(ServerEventsContext)
}
useServerEvents.ConnectionStatus = ConnectionStatus
