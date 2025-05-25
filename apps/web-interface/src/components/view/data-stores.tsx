import { type ColumnDef } from "@tanstack/react-table"
import { type UserDataStore } from "@web-scraper/common"
import { DataTable } from "@/components/common/data-table"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"

const columns: ColumnDef<UserDataStore>[] = [
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
]

export function DataStores() {
  const {
    data: dataStores,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useInfiniteGet("/user-data-stores", { pageSize: 20 })

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
    </div>
  )
}
