import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { type ColumnDef } from "@tanstack/react-table"
import { type ScraperType } from "@web-scraper/common"
import { Copy, Edit, FileUp, History, Plus, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import { TimestampValue } from "../common/label/timestamp-value"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { RefreshButton } from "../common/table/refresh-button"
import { ScraperFormDialog } from "../scraper/scraper-form-dialog"
import { ScraperPanelDialog } from "../scraper/scraper-panel-dialog"
import { Button } from "../shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { cn } from "@/lib/utils"
import { usePost } from "@/hooks/api/usePost"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn/accordion"
import { ScraperExecutionHistory } from "../scraper/execution/scraper-execution-history"

export function Scrapers() {
  const {
    data: scrapers,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/scrapers")

  const { deleteItem, isDeleting } = useDelete("/scrapers/:id")
  const { postItem: importScraper, isPosting: importingScraper } = usePost(
    "/scrapers/import",
    { successMessage: "Scraper imported successfully" },
  )

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scraperToDelete, setScraperToDelete] = useState<ScraperType | null>(
    null,
  )

  const [scraperViewOpen, setScraperViewOpen] = useState(false)
  const [scraperToView, setScraperToView] = useState<ScraperType | null>(null)

  const [upsertDialogOpen, setUpsertDialogOpen] = useState(false)
  const [scraperToEdit, setScraperToEdit] = useState<ScraperType | null>(null)

  const [showExecutionHistory, setShowExecutionHistory] = useState(false)

  const handleDeleteClick = (scraper: ScraperType) => {
    setScraperToDelete(scraper)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!scraperToDelete) {
      return
    }

    const success = await deleteItem({ id: scraperToDelete.id })
    if (success) {
      refresh()
      setDeleteDialogOpen(false)
      setScraperToDelete(null)
    }
  }

  const columns: ColumnDef<ScraperType>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? <NullBadge />,
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
                    setScraperToEdit({
                      ...JSON.parse(JSON.stringify(row.original)),
                      name: `${row.original.name} (copy)`,
                      id: -1, // determines that this is a copy
                    })
                    setUpsertDialogOpen(true)
                  }}
                >
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Scraper</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    setScraperToEdit(row.original)
                    setUpsertDialogOpen(true)
                  }}
                >
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Scraper</TooltipContent>
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
              <TooltipContent>Delete Scraper</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="size-full *:w-256 *:max-w-full grid grid-rows-[auto_1fr_auto] grid-cols-1">
      <div
        data-transition-direction="top"
        className="view-transition p-2 flex flex-row items-center gap-2"
      >
        <Button
          variant="outline"
          onClick={() => {
            setScraperToEdit(null)
            setUpsertDialogOpen(true)
          }}
        >
          <Plus />
          Add Scraper
        </Button>
        <Button
          variant="outline"
          onClick={() => importScraper(null).then(() => refresh())}
          disabled={importingScraper}
        >
          <FileUp />
          Import Scraper
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
        data={scrapers}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRowClick={(row) => {
          setScraperToView(row.original)
          setScraperViewOpen(true)
        }}
      />

      <Accordion
        data-transition-direction="bottom"
        className="view-transition w-full max-h-full grid grid-rows-1 overflow-hidden border-t [box-shadow:0_-0.5rem_1rem_#0006]"
        type="single"
        collapsible
        value={showExecutionHistory ? "item-1" : ""}
        onValueChange={(value) => {
          setShowExecutionHistory(value === "item-1")
        }}
      >
        <AccordionItem
          value="item-1"
          className="grid grid-rows-[auto_1fr] *:data-[slot=accordion-content]:flex"
        >
          <AccordionTrigger className="grid grid-cols-[1fr_auto_1fr] gap-2 *:[svg]:last:justify-self-end p-2">
            <span />
            <div className="flex flex-row items-center gap-2">
              <History className="rotate-0! size-5" />
              {showExecutionHistory
                ? "Hide execution history"
                : "Show execution history"}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 overflow-hidden grid grid-rows-1 w-full h-[max(50vh,20rem)] max-h-full">
            <ScraperExecutionHistory className="overflow-hidden" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ConfirmationDialog
        className="**:data-[slot=dialog-title]:text-destructive"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Scraper"
        description={
          scraperToDelete
            ? `Are you sure you want to delete "${scraperToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <ScraperFormDialog
        open={upsertDialogOpen}
        onOpenChange={setUpsertDialogOpen}
        onSuccess={refresh}
        editScraper={scraperToEdit}
      />

      {scraperToView && (
        <ScraperPanelDialog
          scraper={scraperToView}
          open={scraperViewOpen}
          onOpenChange={(openState) => {
            setScraperViewOpen(openState)
            if (!openState) {
              refresh()
            }
          }}
        />
      )}
    </div>
  )
}
