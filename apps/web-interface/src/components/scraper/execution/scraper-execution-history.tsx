import { NullBadge } from "@/components/common/null-badge"
import { DataTable } from "@/components/common/table/data-table"
import { IteratorDescription } from "@/components/iterator/iterator-description"
import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn, formatDateTime, formatDuration } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef, Row } from "@tanstack/react-table"
import type {
  ExecutionIterator,
  ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import {
  ScraperEventType,
  ScraperInstructionsExecutionInfoType,
  SubscriptionMessageType,
  type ScraperExecutionInfo,
} from "@web-scraper/common"
import { Check, ExternalLink, SquareMousePointer, X } from "lucide-react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react"
import { ScrollableScraperExecutionInfo } from "./scraper-execution-panel"

type ScraperExecutionHistoryProps = ComponentProps<"div"> & {
  scraperId: number
  onApplyIterator?: (iterator: ExecutionIterator) => void
}

export function ScraperExecutionHistory({
  scraperId,
  onApplyIterator,
  ...divProps
}: ScraperExecutionHistoryProps) {
  const {
    data: executions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/scrapers/:id/executions", { id: scraperId })

  ServerEventsProvider.useMessages(
    SubscriptionMessageType.ScraperEvent,
    (message) => {
      if (message.scraperId !== scraperId) {
        return
      }

      if (
        message.event.type === ScraperEventType.ExecutionFinished ||
        message.event.type === ScraperEventType.ExecutionError
      ) {
        refresh()
      }
    },
  )

  const executionInfoColumns = useMemo<ColumnDef<ScraperExecutionInfo>[]>(
    () => [
      // {
      //   accessorKey: "id",
      //   header: "Execution ID",
      //   // accessorFn: (row) => row.id,
      //   cell: ({ row }) => (
      //     <span data-darken={row.index % 2 === 1}>{row.original.id}</span>
      //   ),
      // },
      // Show this column in table that lists execution history of all scrapers
      // {
      //   accessorKey: "scraperId",
      //   header: "Scraper ID",
      //   accessorFn: (row) => row.scraperId,
      // },
      {
        accessorKey: "iterations",
        header: "Number of iterations",
        //TODO: show button to open iterator dialog and option to reuse it for new scraper execution
        cell: ({ row }) => (
          <div className="flex flex-row items-center gap-2">
            <span>{row.original.iterations.length}</span>
            {row.original.iterator ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Iterator
                    <ExternalLink />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-xl">
                  <IteratorDescription
                    iterator={row.original.iterator}
                    className="text-sm"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        if (row.original.iterator) {
                          onApplyIterator?.(row.original.iterator)
                        }
                      }}
                    >
                      <SquareMousePointer />
                      Apply to new execution
                    </Button>
                  </IteratorDescription>
                </PopoverContent>
              </Popover>
            ) : (
              <NullBadge>No iterator</NullBadge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created at",
        cell: ({ row }) => <TimestampValue value={row.original.createdAt} />,
      },
      {
        accessorKey: "total-duration",
        header: "Total duration",
        cell: ({ row }) => {
          const sum = row.original.iterations.reduce((acc, iteration) => {
            return acc + getExecutionInfoDuration(iteration.executionInfo)
          }, 0)
          return formatDuration(sum, "second")
        },
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => {
          const lastExecutionInfo = row.original.iterations
            .at(-1)
            ?.executionInfo.at(-1)
          if (!lastExecutionInfo) {
            return <NullBadge />
          }

          if (
            lastExecutionInfo.type ===
            ScraperInstructionsExecutionInfoType.Success
          ) {
            return (
              <span className="text-success">
                <Check className="size-4 inline" /> Success
              </span>
            )
          } else {
            return (
              <span className="text-destructive">
                <X className="size-4 inline" /> Error
              </span>
            )
          }
        },
      },
    ],
    [onApplyIterator],
  )

  return (
    <div {...divProps} className={cn("flex flex-col", divProps.className)}>
      <DataTable
        className="h-auto grow overflow-hidden grid grid-rows-1"
        tableProps={{
          className:
            "**:[tr]:has-data-[darken=true]:bg-background-darker **:[tr]:has-data-[darken=true]:hover:bg-muted/50",
        }}
        columns={executionInfoColumns}
        data={executions}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        SubComponent={IterationsTable}
      />
    </div>
  )
}

function IterationsTable({ row }: { row: Row<ScraperExecutionInfo> }) {
  return (
    <DataTable
      className={cn(
        row.index % 2 === 1 &&
          "bg-background-darker **:[thead]:bg-background-darker",
      )}
      columns={iterationColumns}
      data={row.original.iterations}
      hasMore={false}
      SubComponent={ExecutionInfoRow}
    />
  )
}

type ExecutionInfoRowProps = {
  row: Row<ScraperExecutionInfo["iterations"][number]>
}

function ExecutionInfoRow({ row }: ExecutionInfoRowProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  return (
    <ScrollableScraperExecutionInfo
      ref={ref}
      className="pt-2"
      executionInfo={row.original.executionInfo}
    />
  )
}

function getExecutionInfoDuration(
  executionInfo: ScraperInstructionsExecutionInfo,
) {
  const lastExecutionInfo = executionInfo.at(-1)
  if (
    lastExecutionInfo?.type === ScraperInstructionsExecutionInfoType.Success ||
    lastExecutionInfo?.type === ScraperInstructionsExecutionInfoType.Error
  ) {
    return lastExecutionInfo.summary.duration
  }
  return 0
}

const iterationColumns: ColumnDef<
  ScraperExecutionInfo["iterations"][number]
>[] = [
  {
    accessorKey: "iteration",
    header: "Iteration",
    accessorFn: (row) => row.iteration,
  },
  {
    accessorKey: "finishedAt",
    header: "Finished at",
    cell: ({ row }) => <TimestampValue value={row.original.finishedAt} />,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = getExecutionInfoDuration(row.original.executionInfo)
      return formatDuration(duration, "second")
    },
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => {
      const lastExecutionInfo = row.original.executionInfo.at(-1)
      if (!lastExecutionInfo) {
        return null
      }

      if (
        lastExecutionInfo.type === ScraperInstructionsExecutionInfoType.Success
      ) {
        return (
          <span className="text-success">
            <Check className="size-4 inline" /> Success
          </span>
        )
      } else {
        return (
          <span className="text-destructive">
            <X className="size-4 inline" /> Error
          </span>
        )
      }
    },
  },
]

function TimestampValue({ value }: { value: number }) {
  const [isNew, setIsNew] = useState(isTimestampNew(value))

  useEffect(() => {
    if (!isNew) {
      return
    }

    const timeout = setTimeout(
      () => {
        setIsNew(false)
      },
      NEW_TIMESTAMP_THRESHOLD - (Date.now() - value),
    )

    return () => clearTimeout(timeout)
  }, [value, isNew])

  return (
    <span className={cn(isNew && "text-success-foreground-light")}>
      {formatDateTime(value)}
    </span>
  )
}

const NEW_TIMESTAMP_THRESHOLD = 1000 * 60 * 15 // * 60 * 24 * 7
function isTimestampNew(value: number) {
  return Date.now() - value < NEW_TIMESTAMP_THRESHOLD
}
