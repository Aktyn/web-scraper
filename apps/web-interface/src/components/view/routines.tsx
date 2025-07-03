import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef } from "@tanstack/react-table"
import type { Routine } from "@web-scraper/common"
import { ScraperEventType, SubscriptionMessageType } from "@web-scraper/common"
import { Edit, MonitorPlay, Plus, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import { TimestampValue } from "../common/label/timestamp-value"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { RefreshButton } from "../common/table/refresh-button"
import { RoutineFormDialog } from "../routine/routine-form-dialog"
import { RoutinePanelDialog } from "../routine/routine-panel-dialog"
import { RoutineStatusBadge } from "../routine/routine-status-badge"
import { ScheduledExecutions } from "../routine/scheduled-executions"
import { SchedulerInfo } from "../routine/scheduler-info"
import { IteratorBadge } from "../scraper/execution/iterator-badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn/accordion"
import { Button } from "../shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"

export function Routines() {
  const {
    data: routines,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/routines")

  const { deleteItem, isDeleting } = useDelete("/routines/:id")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null)

  const [routineViewOpen, setRoutineViewOpen] = useState(false)
  const [routineToView, setRoutineToView] = useState<Routine | null>(null)

  const [upsertDialogOpen, setUpsertDialogOpen] = useState(false)
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null)

  const [showScheduledExecutions, setShowScheduledExecutions] = useState(false)

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
        setTimeout(refresh, 1000)
      }
    },
  )

  const handleDeleteClick = (routine: Routine) => {
    setRoutineToDelete(routine)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!routineToDelete) {
      return
    }

    const success = await deleteItem({ id: routineToDelete.id })
    if (success) {
      refresh()
      setDeleteDialogOpen(false)
      setRoutineToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<Routine>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <RoutineStatusBadge
            status={row.original.status}
            className="max-w-48"
          />
        ),
      },
      {
        accessorKey: "scraperName",
        header: "Scraper",
        cell: ({ row }) => (
          <div className="flex flex-row items-center gap-2">
            <span>{row.original.scraperName}</span>
            <IteratorBadge iterator={row.original.iterator} />
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) =>
          row.original.description ? (
            <span className="inline-block whitespace-normal max-h-24 overflow-y-auto">
              {row.original.description}
            </span>
          ) : (
            <NullBadge />
          ),
      },
      {
        accessorKey: "scheduler",
        header: "Scheduler",
        cell: ({ row }) => (
          <SchedulerInfo
            scheduler={row.original.scheduler}
            className="whitespace-normal"
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created at",
        cell: ({ row }) => <TimestampValue value={row.original.createdAt} />,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated at",
        cell: ({ row }) => (
          <TimestampValue
            className={cn(
              row.original.updatedAt === row.original.createdAt &&
                "text-muted-foreground",
            )}
            value={row.original.updatedAt}
          />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 max-w-32">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    setRoutineToEdit(row.original)
                    setUpsertDialogOpen(true)
                  }}
                >
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Routine</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDeleteClick(row.original)
                  }}
                >
                  <Trash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Routine</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="size-full *:w-320 *:max-w-full grid grid-rows-[auto_1fr_auto] grid-cols-1">
      <div
        data-transition-direction="top"
        className="view-transition p-2 flex flex-row items-center gap-2"
      >
        <Button
          variant="outline"
          onClick={() => {
            setRoutineToEdit(null)
            setUpsertDialogOpen(true)
          }}
        >
          <Plus />
          Add Routine
        </Button>
        <RefreshButton
          onClick={refresh}
          refreshing={isLoading || isLoadingMore}
        />
      </div>

      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100 h-auto overflow-hidden"
        columns={columns}
        data={routines}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRowClick={(row) => {
          setRoutineToView(row.original)
          setRoutineViewOpen(true)
        }}
      />

      <Accordion
        data-transition-direction="bottom"
        className="view-transition w-full max-h-full grid grid-rows-1 overflow-hidden border-t [box-shadow:0_-0.5rem_1rem_#0006]"
        type="single"
        collapsible
        value={showScheduledExecutions ? "item-1" : ""}
        onValueChange={(value) => {
          setShowScheduledExecutions(value === "item-1")
        }}
      >
        <AccordionItem
          value="item-1"
          className="grid grid-rows-[auto_1fr] *:data-[slot=accordion-content]:flex"
        >
          <AccordionTrigger className="grid grid-cols-[1fr_auto_1fr] gap-2 *:[svg]:last:justify-self-end p-2">
            <span />
            <div className="flex flex-row items-center gap-2">
              <MonitorPlay className="rotate-0! size-5" />
              {showScheduledExecutions
                ? "Hide scheduled executions"
                : "Show scheduled executions"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 overflow-hidden grid grid-rows-1 w-full h-[max(50vh,20rem)] max-h-full">
            <ScheduledExecutions />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ConfirmationDialog
        className="**:data-[slot=dialog-title]:text-destructive"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Routine"
        description={
          routineToDelete
            ? `Are you sure you want to delete routine for "${routineToDelete.scraperName}"? This action cannot be undone.`
            : ""
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <RoutineFormDialog
        open={upsertDialogOpen}
        onOpenChange={setUpsertDialogOpen}
        onSuccess={refresh}
        editRoutine={routineToEdit}
      />

      {routineToView && (
        <RoutinePanelDialog
          routine={routineToView}
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
