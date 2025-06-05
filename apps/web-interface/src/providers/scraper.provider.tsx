import { usePost } from "@/hooks/api/usePost"
import {
  ScraperEventType,
  type ScraperInstructionsExecutionInfo,
  ScraperState,
  SubscriptionMessageType,
  type ScraperEvent,
  type ScraperType,
} from "@web-scraper/common"
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react"
import { toast } from "sonner"
import { ServerEventsProvider } from "./server-events.provider"

const ScraperContext = createContext({
  scraper: {} as ScraperType,
  execute: () => Promise.resolve(),
  sendingExecutionRequest: false,

  state: ScraperState.Pending as ScraperState | null,
  partialExecutionInfo: [] as ScraperInstructionsExecutionInfo,
})

const { useMessages } = ServerEventsProvider

export function ScraperProvider({
  children,
  scraper,
}: PropsWithChildren<{ scraper: ScraperType }>) {
  const [state, setState] = useState<ScraperState | null>(null)
  const [partialExecutionInfo, setPartialExecutionInfo] =
    useState<ScraperInstructionsExecutionInfo>([])

  //TODO: load current state from server (REST API) because user can open the panel (which means initializing the ScraperProvider) in the middle of an execution

  useMessages(SubscriptionMessageType.ScraperEvent, (message) => {
    if (message.scraperId !== scraper.name) {
      return
    }

    switch (message.event.type) {
      case ScraperEventType.StateChange:
        setState(message.event.state)
        break
      case ScraperEventType.ExecutionStarted:
        toast.info("Scraper execution started", {
          description: `Scraper "${scraper.name}" is now executing.`,
        })
        setPartialExecutionInfo([]) // Reset partial execution info on new execution
        break
      case ScraperEventType.ExecutionUpdate:
        {
          const update = message.event.update
          setPartialExecutionInfo((prev) => [...prev, update])
        }
        break
      case ScraperEventType.ExecutionFinished:
        toast.info("Scraper execution finished", {
          description: `Scraper "${scraper.name}" has finished executing.`,
        })
        break
      case ScraperEventType.ExecutionError:
        toast.error("Scraper execution error", {
          description: `Scraper "${scraper.name}" encountered an error: ${message.event.error}`,
        })
        break
      default:
        console.warn(
          "Unhandled scraper event type:",
          (message.event as ScraperEvent).type,
        )
        break
    }
  })

  const { postItem: execute, isPosting } = usePost("/scrapers/:id/execute")

  const handleExecute = useCallback(async () => {
    await execute(undefined, { id: scraper.id }, () => void 0)
  }, [execute, scraper.id])

  return (
    <ScraperContext
      value={{
        scraper,
        execute: handleExecute,
        sendingExecutionRequest: isPosting,
        state,
        partialExecutionInfo,
      }}
    >
      {children}
    </ScraperContext>
  )
}

const useScraper = () => {
  const context = useContext(ScraperContext)
  return context
}

ScraperProvider.useContext = useScraper
ScraperProvider.displayName = "ScraperProvider"
