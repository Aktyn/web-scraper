import { CopyButton } from "@/components/common/button/copy-button"
import { DataTable } from "@/components/common/table/data-table"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn, formatDateTime, formatDuration } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef, Row } from "@tanstack/react-table"
import {
  ScraperEventType,
  ScraperInstructionsExecutionInfoType,
  SubscriptionMessageType,
  type ScraperExecutionInfo,
} from "@web-scraper/common"
import { Check, X } from "lucide-react"
import { type ComponentProps } from "react"
import { ScrollableScraperExecutionInfo } from "./scraper-execution-panel"

type ScraperExecutionHistoryProps = ComponentProps<"div"> & {
  scraperId: number
  scraperName: string
}

export function ScraperExecutionHistory({
  scraperId,
  scraperName,
  ...divProps
}: ScraperExecutionHistoryProps) {
  const {
    data: executionInfos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/scrapers/:id/execution-infos", { id: scraperId })

  ServerEventsProvider.useMessages(
    SubscriptionMessageType.ScraperEvent,
    (message) => {
      if (message.scraperId !== scraperName) {
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

  return (
    <div {...divProps} className={cn("flex flex-col", divProps.className)}>
      <DataTable
        className="h-auto grow overflow-hidden grid grid-rows-1 "
        columns={columns}
        data={executionInfos}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        SubComponent={ExecutionInfoRow}
      />
    </div>
  )
}

function ExecutionInfoRow({ row }: { row: Row<ScraperExecutionInfo> }) {
  return (
    <ScrollableScraperExecutionInfo
      className="-m-2 pt-2"
      executionInfo={row.original.executionInfo}
    />
  )
}

const columns: ColumnDef<ScraperExecutionInfo>[] = [
  {
    accessorKey: "executionId",
    header: "Execution ID",
    cell: ({ row }) => (
      <div className="font-medium flex flex-row items-center gap-2">
        <span className="truncate max-w-32">{row.original.executionId}</span>
        <CopyButton value={row.original.executionId} />
      </div>
    ),
  },
  {
    accessorKey: "iteration",
    header: "Iteration",
    cell: ({ row }) => row.original.iteration,
  },
  {
    accessorKey: "createdAt",
    header: "Finished at",
    cell: ({ row }) => formatDateTime(new Date(row.original.createdAt)),
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
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const lastExecutionInfo = row.original.executionInfo.at(-1)
      if (
        lastExecutionInfo?.type ===
          ScraperInstructionsExecutionInfoType.Success ||
        lastExecutionInfo?.type === ScraperInstructionsExecutionInfoType.Error
      ) {
        return formatDuration(lastExecutionInfo.summary.duration, "second")
      }
      return null
    },
  },
  // {
  //   accessorKey: "actions",
  //   header: () => null,
  //   cell: ({ row }) => {
  //     return (
  //       <Tooltip disableHoverableContent>
  //         <TooltipTrigger asChild>
  //           <ChevronDown
  //             className={cn(
  //               "transition-transform ease-bounce size-4 text-muted-foreground",
  //               row.getIsExpanded() && "rotate-180",
  //             )}
  //           />
  //         </TooltipTrigger>
  //         <TooltipContent>
  //           {row.getIsExpanded() ? "Expanded" : "Collapsed"}
  //         </TooltipContent>
  //       </Tooltip>
  //     )
  //   },
  // },
]
