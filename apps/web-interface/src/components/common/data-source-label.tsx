import { useGet } from "@/hooks/api/useGet"
import { Button } from "../shadcn/button"
import { Table } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import type { ComponentProps } from "react"
import { useState } from "react"
import { DataStoreDialog } from "../data-store/data-store-dialog"
import { cn } from "@/lib/utils"

type DataSourceLabelProps = {
  tableName: string
} & ComponentProps<"div">

export function DataSourceLabel({
  tableName,
  ...divProps
}: DataSourceLabelProps) {
  const { data: userDataStore, isLoading } = useGet(
    "/user-data-stores/:tableName",
    { tableName },
  )

  const [dataStoreTableOpen, setDataStoreTableOpen] = useState(false)

  return (
    <div
      {...divProps}
      className={cn("flex flex-row items-center gap-2", divProps.className)}
    >
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
                className="-my-1.5 size-auto p-2"
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
