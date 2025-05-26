import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { cn } from "@/lib/utils"
import { type ColumnDef } from "@tanstack/react-table"
import type { UserDataStore } from "@web-scraper/common"
import { Edit, Plus, Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { RefreshButton } from "../common/table/refresh-button"
import { Button } from "../shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { DataStoreDialog } from "./data-store-dialog"
import { DataStoreRecordDialog } from "./data-store-record-dialog"

type DataStoreTableProps = {
  store: UserDataStore
  className?: string
  onEdit?: (store: UserDataStore) => void
}

export function DataStoreTable({ store: initialStore, className }: DataStoreTableProps) {
  //TODO: allow edit and delete; add option to pin to sidebar for easier access

  const [store, setStore] = useState(initialStore)
  const [upsertRecordDialogOpen, setUpsertRecordDialogOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<Record<string, unknown> | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } = useInfiniteGet(
    "/user-data-stores/:tableName/records",
    { tableName: store.tableName },
  )

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(
    () => [
      ...store.columns.map<ColumnDef<Record<string, unknown>>>((column) => ({
        accessorKey: column.name,
        header: column.name === "id" ? "ID" : column.name,
        cell: ({ row }) => {
          const value = row.original[column.name]
          if (value === null) {
            return <NullBadge />
          }
          return value
        },
      })),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 max-w-24">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    setRecordToEdit(row.original)
                    setUpsertRecordDialogOpen(true)
                  }}
                >
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit data store</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  onClick={(event) => {
                    event.stopPropagation()
                    //TODO
                    //   handleDeleteClick(row.original)
                  }}
                >
                  <Trash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete data store</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [store.columns],
  )

  const handleEditSuccess = (store: UserDataStore) => {
    setStore(store)
    refresh()
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2 items-stretch", className)}>
        <div className="p-2 flex flex-row flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={() => setUpsertRecordDialogOpen(true)}>
            <Plus />
            Add record
          </Button>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit />
            Edit structure
          </Button>
          <RefreshButton onClick={refresh} refreshing={isLoading || isLoadingMore} />
        </div>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>

      <DataStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        editStore={store}
      />

      <DataStoreRecordDialog
        store={store}
        editRecord={recordToEdit}
        open={upsertRecordDialogOpen}
        onOpenChange={setUpsertRecordDialogOpen}
        onSuccess={refresh}
      />
    </>
  )
}
