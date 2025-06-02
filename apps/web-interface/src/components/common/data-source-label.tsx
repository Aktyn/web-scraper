import { useGet } from "@/hooks/api/useGet"
import { Button } from "../shadcn/button"
import { Table } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { useState } from "react"
import { DataStoreDialog } from "../data-store/data-store-dialog"

type DataSourceLabelProps = {
  tableName: string
}

export function DataSourceLabel({ tableName }: DataSourceLabelProps) {
  const { data: userDataStore, isLoading } = useGet(
    "/user-data-stores/:tableName",
    { tableName },
  )

  const [dataStoreTableOpen, setDataStoreTableOpen] = useState(false)

  return (
    <div className="flex flex-row items-center gap-2">
      {isLoading ? (
        tableName
      ) : (
        <>
          <span>{userDataStore?.data.name}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDataStoreTableOpen(true)}
              >
                <Table />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show data</TooltipContent>
          </Tooltip>
          {userDataStore && (
            <DataStoreDialog
              store={userDataStore.data}
              open={dataStoreTableOpen}
              onOpenChange={(openState) => {
                setDataStoreTableOpen(openState)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
