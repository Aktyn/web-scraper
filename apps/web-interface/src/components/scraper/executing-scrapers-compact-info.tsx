import { useGet } from "@/hooks/api/useGet"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import type { ColumnDef } from "@tanstack/react-table"
import type { ExecutingScraperInfo } from "@web-scraper/common"
import { ScraperEventType, SubscriptionMessageType } from "@web-scraper/common"
import { useRef, useState } from "react"
import { DataTable } from "../common/table/data-table"
import { Separator } from "../shadcn/separator"
import { ScraperPanelDialog } from "./scraper-panel-dialog"

export function ExecutingScrapersCompactInfo() {
  const {
    data: executingScrapers,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/scrapers/currently-executing", undefined, {
    pageSize: 1024,
  })

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null)

  ServerEventsProvider.useMessages(
    SubscriptionMessageType.ScraperEvent,
    (message) => {
      if (
        [
          ScraperEventType.ExecutionFinished,
          ScraperEventType.ExecutionError,
          ScraperEventType.ExecutionStarted,
          ScraperEventType.StateChange,
        ].includes(message.event.type)
      ) {
        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current)
        }

        refreshTimeout.current = setTimeout(() => {
          refresh()
          refreshTimeout.current = null
        }, 200)
      }
    },
  )

  const [scraperViewOpen, setScraperViewOpen] = useState(false)
  const [executingScraperInfoToView, setExecutingScraperInfoToView] =
    useState<ExecutingScraperInfo | null>(null)

  const { data: scraperToView, isLoading: isLoadingScraperToView } =
    useGet<"scrapers/:id">(
      executingScraperInfoToView ? "/scrapers/:id" : null,
      {
        id: executingScraperInfoToView?.id ?? -1,
      },
    )

  return (
    <>
      {executingScrapers.length > 0 && (
        <>
          <Separator className="my-2 opacity-50 animate-in zoom-in" />

          <div className="flex flex-col gap-2 contain-inline-size">
            {isLoadingScraperToView && <div>Opening Scraper panel...</div>}
            <DataTable
              columns={columns}
              data={executingScrapers}
              isLoading={isLoading || isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onRowClick={(row) => {
                setExecutingScraperInfoToView(row.original)
                setScraperViewOpen(true)
              }}
            />
          </div>
        </>
      )}

      {scraperToView && (
        <ScraperPanelDialog
          scraper={scraperToView.data}
          open={
            scraperViewOpen &&
            scraperToView.data.id === executingScraperInfoToView?.id
          }
          onOpenChange={(openState) => {
            setScraperViewOpen(openState)
            if (!openState) {
              refresh()
            }
          }}
        />
      )}
    </>
  )
}

const columns: ColumnDef<ExecutingScraperInfo>[] = [
  {
    accessorKey: "name",
    header: ({ table }) => `Executing scrapers (${table.getRowCount()})`,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
]
