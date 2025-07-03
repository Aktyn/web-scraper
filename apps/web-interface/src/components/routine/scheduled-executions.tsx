import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn, formatDateTime } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { Routine, ScheduledScraperExecution } from "@web-scraper/common"
import { Loader2, Play } from "lucide-react"
import type { ComponentProps } from "react"
import { useMemo, useState } from "react"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { IteratorDescription } from "../iterator/iterator-description"
import { Button } from "../shadcn/button"
import { RoutinePanelDialog } from "./routine-panel-dialog"
import { useGet } from "@/hooks/api/useGet"
import { usePost } from "@/hooks/api/usePost"

export function ScheduledExecutions(divProps: ComponentProps<"div">) {
  const {
    data: scheduledScraperExecutions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/routines/scheduled-executions")

  const { postItem: runRoutine } = usePost("/routines/:id/run", {
    successMessage: "Routine executed",
    errorMessage: "Failed to execute routine",
  })

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
        cell: ({ row }) =>
          formatDateTime(row.original.nextScheduledExecutionAt),
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
