import { TimestampValue } from "@/components/common/label/timestamp-value"
import { DataTable } from "@/components/common/table/data-table"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn, formatDuration } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef, Row } from "@tanstack/react-table"
import type { ExecutionIterator } from "@web-scraper/common"
import {
  ScraperEventType,
  SubscriptionMessageType,
  type ScraperExecutionInfo,
} from "@web-scraper/common"
import { useEffect, useMemo, useRef, type ComponentProps } from "react"
import { ExecutionResultInfo } from "./execution-result-info"
import { getExecutionInfoDuration } from "./helpers"
import { IteratorBadge } from "./iterator-badge"
import { ScrollableScraperExecutionInfo } from "./scraper-execution-panel"

type ScraperExecutionHistoryProps = ComponentProps<"div"> & {
  scraperId?: number
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
  } = useInfiniteGet("/scrapers/executions", undefined, {
    id: scraperId,
  })

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

  const executionInfoColumns = useMemo(() => {
    const columns: ColumnDef<ScraperExecutionInfo>[] = [
      {
        accessorKey: "iterations",
        header: "Number of iterations",
        cell: ({ row }) => (
          <div className="flex flex-row items-center gap-2">
            <span>{row.original.iterations.length}</span>
            <IteratorBadge
              iterator={row.original.iterator}
              onApplyIterator={onApplyIterator}
            />
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
        cell: ({ row }) => (
          <ExecutionResultInfo
            executionInfos={row.original.iterations.flatMap(
              (it) => it.executionInfo.at(-1) ?? [],
            )}
          />
        ),
      },
    ]

    if (!scraperId) {
      columns.unshift({
        accessorKey: "scraperId",
        header: "Scraper",
        accessorFn: (row) => row.scraperId,
      })
    }

    return columns
  }, [onApplyIterator, scraperId])

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
    cell: ({ row }) => (
      <ExecutionResultInfo
        executionInfos={row.original.executionInfo.slice(-1)}
      />
    ),
  },
]
