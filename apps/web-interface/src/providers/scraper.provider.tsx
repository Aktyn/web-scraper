import { useGet } from "@/hooks/api/useGet"
import { usePost } from "@/hooks/api/usePost"
import type {
  ApiResponse,
  ExecutionIterator,
  ScraperInstructions,
} from "@web-scraper/common"
import { ScraperState } from "@web-scraper/common"
import {
  ScraperEventType,
  SubscriptionMessageType,
  type ScraperEvent,
  type ScraperInstructionsExecutionInfo,
  type ScraperType,
} from "@web-scraper/common"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react"
import { toast } from "sonner"
import { ServerEventsProvider } from "./server-events.provider"

const ScraperContext = createContext({
  scraper: {} as ScraperType,
  execute: (_iterator: ExecutionIterator | null) =>
    Promise.resolve<ApiResponse<null> | null>(null),
  sendingExecutionRequest: false,

  state: null as ScraperState | null,
  partialExecutionInfo: [] as ScraperInstructionsExecutionInfo,
  currentlyExecutingInstruction: null as ScraperInstructions[number] | null,
})

const { useMessages } = ServerEventsProvider

export function ScraperProvider({
  children,
  scraper,
}: PropsWithChildren<{ scraper: ScraperType }>) {
  const [state, setState] = useState<ScraperState | null>(null)
  const [partialExecutionInfo, setPartialExecutionInfo] =
    useState<ScraperInstructionsExecutionInfo>([])
  const [currentlyExecutingInstruction, setCurrentlyExecutingInstruction] =
    useState<ScraperInstructions[number] | null>(null)

  const { data: executionStatus } = useGet("/scrapers/:id/execution-status", {
    id: scraper.id,
  })

  useEffect(() => {
    if (executionStatus?.data) {
      setState(executionStatus.data.state)
      setPartialExecutionInfo(executionStatus.data.executionInfo)
      setCurrentlyExecutingInstruction(
        executionStatus.data.currentlyExecutingInstruction,
      )
    }
  }, [executionStatus])

  useMessages(SubscriptionMessageType.ScraperEvent, (message) => {
    if (message.scraperId !== scraper.id) {
      return
    }

    switch (message.event.type) {
      case ScraperEventType.StateChange:
        setState(message.event.state)
        if (message.event.state !== ScraperState.Executing) {
          setCurrentlyExecutingInstruction(null)
        }
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
      case ScraperEventType.ExecutingInstruction:
        setCurrentlyExecutingInstruction(message.event.instruction)
        break
      case ScraperEventType.ExecutionFinished:
        setPartialExecutionInfo(message.event.executionInfo)
        setCurrentlyExecutingInstruction(null)
        toast.info("Scraper execution finished", {
          description: `Scraper "${scraper.name}" has finished executing.`,
        })
        break
      case ScraperEventType.ExecutionError:
        setPartialExecutionInfo(message.event.executionInfo ?? [])
        setCurrentlyExecutingInstruction(null)
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

  const { postItem: execute, isPosting } = usePost("/scrapers/:id/execute", {
    successMessage: null,
  })

  const handleExecute = useCallback(
    (iterator: ExecutionIterator | null) =>
      execute({ iterator }, { id: scraper.id }),
    [execute, scraper.id],
  )

  return (
    <ScraperContext
      value={{
        scraper,
        execute: handleExecute,
        sendingExecutionRequest: isPosting,
        state,
        partialExecutionInfo,
        currentlyExecutingInstruction,
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
