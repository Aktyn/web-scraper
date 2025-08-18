import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { DataTable } from "@/components/common/table/data-table"
import { Button } from "@/components/shadcn/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { usePinnedDataStores } from "@/providers/pinned-data-stores.provider"
import type { ColumnDef } from "@tanstack/react-table"
import type { UserDataStore } from "@web-scraper/common"
import { Edit, Plus, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { PinStoreButton } from "../common/button/pin-store-button"
import { NullBadge } from "../common/null-badge"
import { RefreshButton } from "../common/table/refresh-button"
import { DataStoreDialog } from "../data-store/data-store-dialog"
import { DataStoreFormDialog } from "../data-store/data-store-form-dialog"
import { TermInfo } from "../info/term-info"
import { DataTableColumnHeader } from "../common/table/data-table-column-header"
import { type SortingState } from "@tanstack/react-table"
import { type UserDataStoreQuery } from "@web-scraper/common"

export function DataStores() {
  const { unpinDataStore } = usePinnedDataStores()

  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<
    Pick<UserDataStoreQuery, "name" | "description">
  >({})

  const {
    data: dataStores,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/user-data-stores", undefined, {
    ...filters,
    sortBy: sorting[0]?.id as UserDataStoreQuery["sortBy"],
    sortOrder: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
  })

  const { deleteItem, isDeleting } = useDelete("/user-data-stores/:tableName")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<UserDataStore | null>(null)

  const [upsertDialogOpen, setUpsertDialogOpen] = useState(false)
  const [storeToEdit, setStoreToEdit] = useState<UserDataStore | null>(null)

  const [dataStoreTableOpen, setDataStoreTableOpen] = useState(false)
  const [storeToView, setStoreToView] = useState<UserDataStore | null>(null)

  const handleDeleteClick = (store: UserDataStore) => {
    setStoreToDelete(store)
    setDeleteDialogOpen(true)
  }

  const handleEditClick = (store: UserDataStore) => {
    setStoreToEdit(store)
    setUpsertDialogOpen(true)
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
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Name"
            filterType={DataTableColumnHeader.FilterType.Text}
            onFilterChange={(name) =>
              setFilters((prev) => ({ ...prev, name: name ?? undefined }))
            }
          />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Description"
            filterType={DataTableColumnHeader.FilterType.Text}
            onFilterChange={(description) =>
              setFilters((prev) => ({
                ...prev,
                description: description ?? undefined,
              }))
            }
          />
        ),
        cell: ({ row }) => row.original.description ?? <NullBadge />,
      },
      {
        accessorKey: "recordsCount",
        header: () => "Records count",
        cell: ({ row }) => row.original.recordsCount,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 max-w-32">
            <PinStoreButton store={row.original} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleEditClick(row.original)
                  }}
                >
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Data Store</TooltipContent>
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
              <TooltipContent>Delete Data Store</TooltipContent>
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
        className="view-transition p-2 flex flex-row items-center gap-2"
      >
        <Button
          variant="outline"
          onClick={() => {
            setStoreToEdit(null)
            setUpsertDialogOpen(true)
          }}
        >
          <Plus />
          Add data store
        </Button>
        <TermInfo term="dataStore" />
        <RefreshButton
          onClick={refresh}
          refreshing={isLoading || isLoadingMore}
        />
      </div>
      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100"
        columns={columns}
        data={dataStores}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRowClick={(row) => {
          setStoreToView(row.original)
          setDataStoreTableOpen(true)
        }}
        state={{
          sorting,
        }}
        onSortingChange={setSorting}
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

      <DataStoreFormDialog
        open={upsertDialogOpen}
        onOpenChange={setUpsertDialogOpen}
        onSuccess={(store) => {
          unpinDataStore(store)
          refresh()
        }}
        editStore={storeToEdit}
      />

      {storeToView && (
        <DataStoreDialog
          store={storeToView}
          open={dataStoreTableOpen}
          onOpenChange={(openState) => {
            setDataStoreTableOpen(openState)
            if (!openState) {
              refresh()
            }
          }}
        />
      )}
    </div>
  )
}
