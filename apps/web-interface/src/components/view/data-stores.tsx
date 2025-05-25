import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { DataTable } from "@/components/common/data-table"
import { Button } from "@/components/shadcn/button"
import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import type { ColumnDef } from "@tanstack/react-table"
import type { UserDataStore } from "@web-scraper/common"
import { Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"

export function DataStores() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<UserDataStore | null>(null)

  const {
    data: dataStores,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/user-data-stores", undefined)

  const { deleteItem, isDeleting } = useDelete("/user-data-stores/:tableName")

  const handleDeleteClick = (store: UserDataStore) => {
    setStoreToDelete(store)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) {
      return
    }

    const success = await deleteItem({ tableName: storeToDelete.tableName })
    if (success) {
      refresh()
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    }
  }

  const columns: ColumnDef<UserDataStore>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const name = row.getValue("name") as string
          return <div className="font-medium">{name}</div>
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue("description") as string | null
          return description ?? "---"
        },
      },
      {
        accessorKey: "recordsCount",
        header: () => "Records count",
        cell: ({ row }) => {
          const count = row.getValue("recordsCount") as number
          return count
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const store = row.original
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(store)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete data store</TooltipContent>
            </Tooltip>
          )
        },
      },
    ],
    [],
  )

  return (
    <div data-transition-direction="top" className="view-transition size-full">
      <DataTable
        className="w-256 max-w-full"
        columns={columns}
        data={dataStores}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      <ConfirmationDialog
        className="**:data-[slot=dialog-title]:text-destructive"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Data Store"
        description={
          storeToDelete
            ? `Are you sure you want to delete "${storeToDelete.name}"? This action cannot be undone and will permanently delete all data in this store.`
            : ""
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}
