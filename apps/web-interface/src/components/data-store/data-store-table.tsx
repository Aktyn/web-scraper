import { useDelete } from "@/hooks/api/useDelete"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { useStateToRef } from "@/hooks/useStateToRef"
import { cn, formatDateTime } from "@/lib/utils"
import { type ColumnDef } from "@tanstack/react-table"
import {
  SqliteColumnType,
  type UserDataStoreColumn,
  type UserDataStore,
} from "@web-scraper/common"
import { Check, Download, Edit, Plus, Trash, X } from "lucide-react"
import { useMemo, useState } from "react"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { RefreshButton } from "../common/table/refresh-button"
import { Badge } from "../shadcn/badge"
import { Button } from "../shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { DataStoreFormDialog } from "./data-store-form-dialog"
import { DataStoreRecordDialog } from "./data-store-record-dialog"

type DataStoreTableProps = {
  store: UserDataStore
  className?: string
  onEdit?: (store: UserDataStore) => void
}

export function DataStoreTable({
  store: initialStore,
  className,
}: DataStoreTableProps) {
  const [store, setStore] = useState(initialStore)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<Record<
    string,
    unknown
  > | null>(null)

  const [upsertRecordDialogOpen, setUpsertRecordDialogOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<Record<
    string,
    unknown
  > | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    useInfiniteGet("/user-data-stores/:tableName/records", {
      tableName: store.tableName,
    })

  const { deleteItem, isDeleting } = useDelete(
    "/user-data-stores/:tableName/records/:id",
  )

  const handleDeleteClick = (record: Record<string, unknown>) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) {
      return
    }

    const success = await deleteItem({
      tableName: store.tableName,
      id: recordToDelete.id as number,
    })
    if (success) {
      refresh()
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    }
  }

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(
    () => [
      ...store.columns.map<ColumnDef<Record<string, unknown>>>((column) => ({
        accessorKey: column.name,
        header:
          column.name === "id"
            ? "ID"
            : () => <ColumnNameLabel column={column} />,
        cell: ({ row }) => {
          const value = row.original[column.name]
          if (value === null) {
            return <NullBadge />
          }
          return <TypedValue value={value} type={column.type} />
        },
      })),
      {
        id: "actions",
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
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDeleteClick(row.original)
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

  const refreshRef = useStateToRef(refresh)
  const handleEditSuccess = (store: UserDataStore) => {
    setStore(store)
    setTimeout(() => {
      refreshRef.current()
    }, 100)
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-2 items-stretch overflow-hidden",
          className,
        )}
      >
        <div className="p-2 flex flex-row flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => {
              setRecordToEdit(null)
              setUpsertRecordDialogOpen(true)
            }}
          >
            <Plus />
            Add record
          </Button>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit />
            Edit structure
          </Button>
          <RefreshButton
            onClick={refresh}
            refreshing={isLoading || isLoadingMore}
          />
        </div>
        <DataTable
          className="h-auto grow overflow-hidden"
          key={store.tableName}
          columns={columns}
          data={data}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>

      <ConfirmationDialog
        className="**:data-[slot=dialog-title]:text-destructive"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Data Store record"
        description={
          recordToDelete
            ? `Are you sure you want to delete record ${recordToDelete.id}? This action cannot be undone and will permanently delete the record.`
            : ""
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <DataStoreFormDialog
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

function ColumnNameLabel({ column }: { column: UserDataStoreColumn }) {
  return (
    <div className="flex flex-row items-center gap-1">
      <span>{column.name}</span>
      <Badge className="text-xxs! bg-muted/50 text-muted-foreground px-1">
        {column.type}
      </Badge>
    </div>
  )
}

function TypedValue({
  value,
  type,
}: {
  value: unknown
  type: SqliteColumnType
}) {
  switch (type) {
    case SqliteColumnType.TEXT:
    case SqliteColumnType.NUMERIC:
    case SqliteColumnType.INTEGER:
    case SqliteColumnType.REAL:
      return <div>{value as string | number}</div>
    case SqliteColumnType.BLOB:
      return (
        <div className="flex flex-row items-center gap-1">
          <Badge variant="outline">Binary data</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-5"
                onClick={() => {
                  fetch(value as string)
                    .then((response) => response.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob)
                      window.open(url, "_blank")
                    })
                    .catch(console.error)
                }}
              >
                <Download />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download file</TooltipContent>
          </Tooltip>
        </div>
      )
    case SqliteColumnType.BOOLEAN:
      return value ? (
        <div>
          <Check className="inline size-5" />
          &nbsp; True
        </div>
      ) : (
        <div>
          <X className="inline size-5" />
          &nbsp; False
        </div>
      )
    case SqliteColumnType.TIMESTAMP: {
      const date = new Date(value as number)
      return <div>{formatDateTime(date)}</div>
    }
  }
}
