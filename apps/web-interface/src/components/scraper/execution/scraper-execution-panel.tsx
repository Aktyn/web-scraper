import { IteratorDescription } from "@/components/iterator/iterator-description"
import { IteratorFormDialog } from "@/components/iterator/iterator-form-dialog"
import { Button } from "@/components/shadcn/button"
import { ScrollArea, ScrollBar } from "@/components/shadcn/scroll-area"
import { usePost } from "@/hooks/api/usePost"
import { cn } from "@/lib/utils"
import { ScraperProvider } from "@/providers/scraper.provider"
import type {
  ExecutionIterator,
  ScraperInstructions,
  ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import {
  ScraperInstructionsExecutionInfoType,
  scraperInstructionsSchema,
  ScraperInstructionType,
  ScraperState,
} from "@web-scraper/common"
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MonitorX,
  Play,
  Settings2,
} from "lucide-react"
import type { ComponentProps, Ref, RefObject } from "react"
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { ScraperExecutionInfo } from "./scraper-execution-info"
import { ScraperPagePortals } from "./scraper-page-portals"

export type ScraperExecutionPanelRef = {
  applyIterator: (iterator: ExecutionIterator) => void
}

type ScraperExecutionPanelProps = {
  ref?: Ref<ScraperExecutionPanelRef>
}

export function ScraperExecutionPanel({ ref }: ScraperExecutionPanelProps) {
  const {
    scraper,
    execute,
    sendingExecutionRequest,
    state,
    partialExecutionInfo,
    currentlyExecutingInstruction,
  } = ScraperProvider.useContext()

  const [iterator, setIterator] = useState<ExecutionIterator | null>(null)
  const [iteratorDialogOpen, setIteratorDialogOpen] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      applyIterator: setIterator,
    }),
    [],
  )

  return (
    <div className="flex flex-col items-stretch gap-3">
      {(!state || state === ScraperState.Exited) && (
        <>
          <div className="flex flex-row items-center gap-2">
            <IteratorDescription
              iterator={iterator}
              className="w-full bg-card border p-3 rounded-xl"
            >
              <Button
                variant="outline"
                tabIndex={-1}
                onClick={() => setIteratorDialogOpen(true)}
              >
                <Settings2 />
                Configure iterator
              </Button>
            </IteratorDescription>

            <IteratorFormDialog
              open={iteratorDialogOpen}
              onOpenChange={setIteratorDialogOpen}
              iterator={iterator}
              onChange={setIterator}
              dataSources={scraper.dataSources}
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Button
              className="flex-grow"
              variant="default"
              onClick={() => execute(iterator)}
              disabled={sendingExecutionRequest}
            >
              <Play />
              {sendingExecutionRequest ? "Executing..." : "Execute"}
            </Button>
          </div>
        </>
      )}

      {state && (
        <div className="flex flex-col items-stretch gap-1">
          <h4 className="text-center">
            <ScraperStateWidget
              scraperId={scraper.id}
              state={state}
              result={partialExecutionInfo.at(-1)?.type}
            />
          </h4>
        </div>
      )}

      {(partialExecutionInfo.length > 0 || currentlyExecutingInstruction) && (
        <ScrollableScraperExecutionInfo
          className="-mx-6 -mb-3 contain-inline-size"
          autoScroll
          executionInfo={partialExecutionInfo}
          currentlyExecutingInstruction={currentlyExecutingInstruction}
        />
      )}

      {state === ScraperState.Executing && (
        <ScraperPagePortals executionInfo={partialExecutionInfo} />
      )}
    </div>
  )
}

type ScraperStateWidgetProps = {
  scraperId: number
  state: ScraperState
  result?: ScraperInstructionsExecutionInfoType
}

function ScraperStateWidget({
  scraperId,
  state,
  result,
}: ScraperStateWidgetProps) {
  const { postItem: terminate, isPosting: terminating } = usePost(
    "/scrapers/:id/terminate",
    {
      successMessage: "Scraper terminated",
      errorMessage: "Failed to terminate scraper",
    },
  )

  switch (state) {
    case ScraperState.Pending:
    case ScraperState.Idle:
      return <LoaderCircle className="animate-spin inline" />

    case ScraperState.Executing:
      return (
        <div className="grid grid-cols-[8rem_auto_8rem] grid-rows-1 items-center justify-stretch gap-2">
          <div className="col-start-2 grid grid-cols-[1fr_auto_1fr] grid-rows-1 items-center gap-2">
            <AnimatedLine />
            <span className="text-primary font-semibold text-shadow-[0_0_0.5rem] text-shadow-primary/50">
              Executing
            </span>
            <AnimatedLine reverse />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-end"
            disabled={terminating}
            onClick={() =>
              terminate(null, { id: scraperId }).catch(console.error)
            }
          >
            <MonitorX />
            Terminate
          </Button>
        </div>
      )

    case ScraperState.Exited:
      return (
        <span
          className={cn(
            "text-warning font-semibold",
            result === ScraperInstructionsExecutionInfoType.Success &&
              "text-success",
            result === ScraperInstructionsExecutionInfoType.Error &&
              "text-destructive",
          )}
        >
          Scraper exited with{" "}
          <u>
            {result === ScraperInstructionsExecutionInfoType.Success
              ? "success"
              : result === ScraperInstructionsExecutionInfoType.Error
                ? "error"
                : "unknown result"}
          </u>
        </span>
      )

    default:
      return null
  }
}

type ScrollableScraperExecutionInfoProps = {
  autoScroll?: boolean
  executionInfo: ScraperInstructionsExecutionInfo
  currentlyExecutingInstruction?: ScraperInstructions[number] | null
} & ComponentProps<typeof ScrollArea>

export function ScrollableScraperExecutionInfo({
  autoScroll,
  executionInfo,
  currentlyExecutingInstruction,
  ...scrollAreaProps
}: ScrollableScraperExecutionInfoProps) {
  const horizontalItemsContainerRef = useRef<HTMLDivElement>(null)

  const scrollHorizontal = (direction: "left" | "right") => {
    const container = horizontalItemsContainerRef.current
    const scrollContainer = container?.parentElement?.parentElement
    if (!container || !scrollContainer) {
      return
    }

    const children = Array.from(container.children)
    if (children.length === 0) {
      return
    }

    const containerRect = scrollContainer.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2

    let closestIdx = 0
    let minDist = Infinity
    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect()
      const childCenter = rect.left + rect.width / 2
      const dist = Math.abs(childCenter - containerCenter)
      if (dist < minDist) {
        minDist = dist
        closestIdx = idx
      }
    })

    const targetIdx =
      direction === "left"
        ? Math.max(closestIdx - 1, 0)
        : Math.min(closestIdx + 1, children.length - 1)

    if (targetIdx !== closestIdx) {
      children[targetIdx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }

  const isCurrentlyExecuting = !!currentlyExecutingInstruction
  useEffect(() => {
    const container = horizontalItemsContainerRef.current
    if (!container || !autoScroll) {
      return
    }

    if (executionInfo.length > 0 || isCurrentlyExecuting) {
      Array.from(container.children).at(-1)?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      })
    }
  }, [autoScroll, executionInfo.length, isCurrentlyExecuting])

  return (
    <ScrollArea
      {...scrollAreaProps}
      className={cn("relative", scrollAreaProps.className)}
    >
      <Button
        variant="ghost"
        className="z-20 absolute inset-y-0 left-0 w-6 h-full bg-gradient-to-r from-background to-transparent"
        onClick={() => scrollHorizontal("left")}
      >
        <ChevronLeft />
      </Button>
      <ExecutionConditionsMap
        executionInfo={[...executionInfo, currentlyExecutingInstruction].filter(
          (info) => !!info,
        )}
        rowRef={horizontalItemsContainerRef}
      />
      <ScraperExecutionInfo
        ref={horizontalItemsContainerRef}
        executionInfo={executionInfo}
        currentlyExecutingInstruction={currentlyExecutingInstruction}
      />
      <Button
        variant="ghost"
        className="z-20 absolute inset-y-0 right-0 w-6 h-full bg-gradient-to-l from-background to-transparent"
        onClick={() => scrollHorizontal("right")}
      >
        <ChevronRight />
      </Button>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

const AnimatedLine = ({ reverse }: { reverse?: boolean }) => (
  <div className="relative h-[2px] overflow-hidden rounded-full">
    <div
      className={cn(
        "absolute h-full my-auto w-[200%] bg-linear-90 from-transparent from-15% via-primary to-transparent to-85% animate-in repeat-infinite duration-1000 ease-in-out direction-alternate",
        reverse
          ? "slide-in-from-right-[50%] right-0"
          : "slide-in-from-left-[50%] left-0",
      )}
    />
  </div>
)

type ExecutionConditionsMapProps = {
  executionInfo: Array<
    ScraperInstructionsExecutionInfo[number] | ScraperInstructions[number]
  >
  rowRef: RefObject<HTMLDivElement | null>
}

function ExecutionConditionsMap({
  executionInfo,
  rowRef,
}: ExecutionConditionsMapProps) {
  const updateConnectors = useCallback(() => {
    const rowContainer = rowRef.current
    const executionInfoElements = rowContainer?.children

    if (!rowContainer || !executionInfoElements?.length) {
      return []
    }

    const left = rowContainer.getBoundingClientRect().left

    const indexMap: Array<{
      fromIndex: number
      toIndex: number
      isMet: boolean
    }> = []

    for (let i = 0; i < executionInfo.length; i++) {
      const info = executionInfo[i]
      if (
        info.type === ScraperInstructionsExecutionInfoType.Instruction &&
        info.instructionInfo.type === ScraperInstructionType.Condition
      ) {
        const nextInstructionIndex = executionInfo.findIndex(
          (nextInfo, index) =>
            index > i &&
            (nextInfo.type === ScraperInstructionsExecutionInfoType.Success ||
              ScraperInstructionsExecutionInfoType.Error ||
              ScraperInstructionsExecutionInfoType.Instruction ||
              scraperInstructionsSchema.element.safeParse(nextInfo).success),
        )

        if (nextInstructionIndex === -1) {
          continue
        }

        indexMap.push({
          fromIndex: i,
          toIndex: nextInstructionIndex,
          isMet: info.instructionInfo.isMet,
        })
      }
    }

    return indexMap.reduce(
      (acc, { fromIndex, toIndex, isMet }) => {
        const fromElement = executionInfoElements[fromIndex]
        const toElement = executionInfoElements[toIndex]

        if (!fromElement || !toElement) {
          return acc
        }

        const fromRect = fromElement.getBoundingClientRect()
        const toRect = toElement.getBoundingClientRect()

        const xLeft = fromRect.left + fromRect.width / 2 - left
        const xRight = toRect.left + toRect.width / 2 - left

        acc.push({
          isMet,
          xLeft,
          xRight,
        })

        return acc
      },
      [] as Array<{ isMet: boolean; xLeft: number; xRight: number }>,
    )
  }, [executionInfo, rowRef])

  const [connectors, setConnectors] = useState(updateConnectors())

  useEffect(() => {
    const timeout = setTimeout(() => {
      setConnectors(updateConnectors())
    }, 16)
    return () => clearTimeout(timeout)
  }, [updateConnectors])

  if (!connectors.length) {
    return null
  }

  return (
    <div className="w-full h-6 relative">
      {connectors.map(({ isMet, xLeft, xRight }, index) => (
        <div
          key={index}
          className={cn(
            "absolute h-1/2 bottom-0 border border-b-0 border-dashed rounded-tl-lg rounded-tr-lg flex justify-center items-start",
            isMet
              ? "border-primary text-primary"
              : "border-secondary text-secondary",
          )}
          style={{
            left: `${xLeft}px`,
            width: `${xRight - xLeft}px`,
          }}
        >
          <span className="block w-auto mx-auto -translate-y-[50%] leading-none px-2 backdrop-blur-xs font-semibold">
            {isMet ? "THEN" : "ELSE"}
          </span>
        </div>
      ))}
    </div>
  )
}
