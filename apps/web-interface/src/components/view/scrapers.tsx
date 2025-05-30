import { Copy, Edit, Plus, Trash } from "lucide-react"
import { RefreshButton } from "../common/table/refresh-button"
import { Button } from "../shadcn/button"
import { type ColumnDef } from "@tanstack/react-table"
import { type ScraperType } from "@web-scraper/common"
import { useMemo, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { DataTable } from "../common/table/data-table"
import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { NullBadge } from "../common/null-badge"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import { ScraperPanelDialog } from "../scraper/scraper-panel-dialog"
import { ScraperFormDialog } from "../scraper/scraper-form-dialog"

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scraperToDelete, setScraperToDelete] = useState<ScraperType | null>(null)

  const [scraperViewOpen, setScraperViewOpen] = useState(false)
  const [scraperToView, setScraperToView] = useState<ScraperType | null>(null)

  const [upsertDialogOpen, setUpsertDialogOpen] = useState(false)
  const [scraperToEdit, setScraperToEdit] = useState<ScraperType | null>(null)

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
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? <NullBadge />,
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
    <div className="size-full *:w-256 *:max-w-full">
      <div
        data-transition-direction="top"
        className="view-transition p-2 flex flex-row items-center"
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
        <RefreshButton onClick={refresh} refreshing={isLoading || isLoadingMore} />
      </div>
      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100"
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
