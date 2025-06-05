import { Button } from "@/components/shadcn/button"
import { ScrollArea, ScrollBar } from "@/components/shadcn/scroll-area"
import { cn } from "@/lib/utils"
import { ScraperProvider } from "@/providers/scraper.provider"
import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import {
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperState,
  type ScraperType,
} from "@web-scraper/common"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderCircle,
  Play,
} from "lucide-react"
import type { RefObject } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ScraperFormDialog } from "../scraper-form-dialog"
import { ScraperExecutionInfo } from "./scraper-execution-info"

type ScraperExecutionPanelProps = {
  onEditSuccess?: (scraper: ScraperType) => void
}

export function ScraperExecutionPanel({
  onEditSuccess,
}: ScraperExecutionPanelProps) {
  const {
    scraper,
    execute,
    sendingExecutionRequest,
    state,
    partialExecutionInfo,
    currentlyExecutingInstruction,
  } = ScraperProvider.useContext()

  const horizontalItemsContainerRef = useRef<HTMLDivElement>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)

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
    if (!container) {
      return
    }

    if (partialExecutionInfo.length > 0 || isCurrentlyExecuting) {
      Array.from(container.children).at(-1)?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      })
    }
  }, [partialExecutionInfo.length, isCurrentlyExecuting])

  return (
    <div className="flex flex-col items-stretch gap-3">
      {(!state || state === ScraperState.Exited) && (
        <div className="flex flex-row items-center gap-4">
          <Button
            className="flex-grow"
            variant="default"
            onClick={execute}
            disabled={sendingExecutionRequest}
          >
            <Play />
            {sendingExecutionRequest ? "Executing..." : "Execute"}
          </Button>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit />
            Edit
          </Button>
        </div>
      )}
      <ScraperFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onEditSuccess}
        editScraper={scraper}
      />

      {state && (
        <div className="flex flex-col items-stretch gap-1">
          <h4 className="text-center">
            <ScraperStateWidget
              state={state}
              result={partialExecutionInfo.at(-1)?.type}
            />
          </h4>
        </div>
      )}

      {partialExecutionInfo.length > 0 && (
        <ScrollArea className="contain-inline-size -mx-6 -mb-3 relative">
          <Button
            variant="ghost"
            className="absolute inset-y-0 left-0 w-6 h-full bg-gradient-to-r from-background to-transparent"
            onClick={() => scrollHorizontal("left")}
          >
            <ChevronLeft />
          </Button>
          <ExecutionConditionsMap
            executionInfo={partialExecutionInfo}
            rowRef={horizontalItemsContainerRef}
          />
          <ScraperExecutionInfo
            ref={horizontalItemsContainerRef}
            executionInfo={partialExecutionInfo}
            currentlyExecutingInstruction={currentlyExecutingInstruction}
          />
          <Button
            variant="ghost"
            className="absolute inset-y-0 right-0 w-6 h-full bg-gradient-to-l from-background to-transparent"
            onClick={() => scrollHorizontal("right")}
          >
            <ChevronRight />
          </Button>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  )
}

type ScraperStateWidgetProps = {
  state: ScraperState
  result?: ScraperInstructionsExecutionInfoType
}

function ScraperStateWidget({ state, result }: ScraperStateWidgetProps) {
  switch (state) {
    case ScraperState.Pending:
    case ScraperState.Idle:
      return <LoaderCircle className="animate-spin inline" />

    case ScraperState.Executing:
      return (
        <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-1 items-center gap-2">
          <AnimatedLine />
          <span className="text-primary font-semibold text-shadow-[0_0_0.5rem] text-shadow-primary/50">
            Executing
          </span>
          <AnimatedLine reverse />
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
  executionInfo: ScraperInstructionsExecutionInfo
  rowRef: RefObject<HTMLDivElement | null>
}

function ExecutionConditionsMap({
  executionInfo,
  rowRef,
}: ExecutionConditionsMapProps) {
  const connectors = useMemo(() => {
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
            nextInfo.type === ScraperInstructionsExecutionInfoType.Instruction,
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
