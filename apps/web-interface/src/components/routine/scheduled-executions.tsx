import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ScheduledScraperExecution } from "@web-scraper/common"
import type { ComponentProps } from "react"
import { useMemo } from "react"
import { DataTable } from "../common/table/data-table"

export function ScheduledExecutions(divProps: ComponentProps<"div">) {
  const scheduledScraperExecutions: ScheduledScraperExecution[] = []

  const columns = useMemo<ColumnDef<ScheduledScraperExecution>[]>(
    () => [
      {
        accessorKey: "scraperId",
        header: "Scraper",
        cell: ({ row }) => row.original.scraperId,
      },
    ],
    [],
  )

  return (
    <div {...divProps} className={cn("flex flex-col", divProps.className)}>
      <DataTable
        columns={columns}
        data={scheduledScraperExecutions}
        // isLoading={isLoading || isStatusLoading}
      />
    </div>
  )
}
