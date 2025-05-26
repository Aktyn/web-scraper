import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { DataTable } from "@/components/common/data-table"
import { Button } from "@/components/shadcn/button"
import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import type { ColumnDef } from "@tanstack/react-table"
import type { UserDataStore } from "@web-scraper/common"
import { Edit, Plus, RefreshCcw, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { NullBadge } from "../common/null-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { DataStoreDialog } from "./data-store-dialog"

export function DataStores() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<UserDataStore | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [storeToEdit, setStoreToEdit] = useState<UserDataStore | null>(null)

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

  const handleEditClick = (store: UserDataStore) => {
    setStoreToEdit(store)
    setEditDialogOpen(true)
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
          return description ?? <NullBadge />
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
            <div className="flex items-center gap-1 max-w-24">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(store)}>
                    <Edit />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit data store</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(store)}>
                    <Trash />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete data store</TooltipContent>
              </Tooltip>
            </div>
          )
        },
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
        <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
          <Plus />
          Add data store
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={refresh} className="ml-auto">
              <RefreshCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh table</TooltipContent>
        </Tooltip>
      </div>
      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100"
        columns={columns}
        data={dataStores}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        // onRowClick={handleRowClick} //TODO: open view with data store table; allow edit and delete; add option to pin to sidebar for easier access
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

      <DataStoreDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refresh}
      />

      <DataStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refresh}
        editStore={storeToEdit}
      />
    </div>
  )
}
