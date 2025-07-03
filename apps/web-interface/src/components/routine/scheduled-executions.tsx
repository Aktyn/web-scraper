import { useGet } from "@/hooks/api/useGet"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { usePost } from "@/hooks/api/usePost"
import { cn, formatDateTime } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ScraperEventType,
  SubscriptionMessageType,
  type Routine,
  type ScheduledScraperExecution,
} from "@web-scraper/common"
import { Loader2, Play } from "lucide-react"
import type { ComponentProps } from "react"
import { useMemo, useState } from "react"
import { Countdown } from "../common/label/countdown"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { IteratorDescription } from "../iterator/iterator-description"
import { Button } from "../shadcn/button"
import { RoutinePanelDialog } from "./routine-panel-dialog"

export function ScheduledExecutions(divProps: ComponentProps<"div">) {
  const {
    data: scheduledScraperExecutions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/routines/scheduled-executions")

  const { postItem: runRoutine } = usePost("/routines/:id/execute", {
    successMessage: "Routine executed",
    errorMessage: "Failed to execute routine",
  })

  ServerEventsProvider.useMessages(
    SubscriptionMessageType.ScraperEvent,
    (message) => {
      if (
        [
          ScraperEventType.ExecutionFinished,
          ScraperEventType.ExecutionError,
          ScraperEventType.ExecutionStarted,
        ].includes(message.event.type)
      ) {
        refresh()
      }
    },
  )

  const [routineViewOpen, setRoutineViewOpen] = useState(false)
  const [routineIdToView, setRoutineIdToView] = useState<Routine["id"] | null>(
    null,
  )

  const { data: routineToView, isLoading: isRoutineLoading } = useGet(
    routineIdToView ? "/routines/:id" : null,
    { id: routineIdToView ?? 0 },
  )

  const columns = useMemo<ColumnDef<ScheduledScraperExecution>[]>(
    () => [
      {
        accessorKey: "scraperName",
        header: "Scraper",
        cell: ({ row }) => (
          <div>
            {isRoutineLoading && routineIdToView === row.original.routineId && (
              <Loader2 className="size-4 animate-spin inline mr-2 opacity-100 starting:mr-0 starting:opacity-0 transition-[margin-right,opacity]" />
            )}
            {row.original.scraperName}
          </div>
        ),
      },
      {
        accessorKey: "iterator",
        header: "Iterator",
        cell: ({ row }) =>
          row.original.iterator ? (
            <IteratorDescription iterator={row.original.iterator} />
          ) : (
            <NullBadge />
          ),
      },
      {
        accessorKey: "nextScheduledExecutionAt",
        header: "Next execution",
        cell: ({ row }) => (
          <div className="flex flex-row items-baseline gap-1">
            <span>{formatDateTime(row.original.nextScheduledExecutionAt)}</span>
            <span className="text-xs text-muted-foreground">
              (
              <Countdown timestamp={row.original.nextScheduledExecutionAt} />)
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 max-w-20">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                runRoutine(null, { id: row.original.routineId })
                  .then(refresh)
                  .catch(console.error)
              }}
            >
              <Play />
              Execute now
            </Button>
          </div>
        ),
      },
    ],
    [isRoutineLoading, refresh, routineIdToView, runRoutine],
  )

  return (
    <div {...divProps} className={cn("flex flex-col", divProps.className)}>
      <DataTable
        columns={columns}
        data={scheduledScraperExecutions}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRowClick={(row) => {
          setRoutineIdToView(row.original.routineId)
          setRoutineViewOpen(true)
        }}
      />

      {routineToView?.data && !isRoutineLoading && (
        <RoutinePanelDialog
          routine={routineToView.data}
          open={routineViewOpen}
          onOpenChange={(openState) => {
            setRoutineViewOpen(openState)
            if (!openState) {
              refresh()
            }
          }}
        />
      )}
    </div>
  )
}
