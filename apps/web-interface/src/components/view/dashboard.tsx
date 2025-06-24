import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { DataTable } from "../common/table/data-table"
import { Button } from "../shadcn/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { Notification } from "@web-scraper/common"
import { NotificationType } from "@web-scraper/common"
import { formatDateTime } from "@/lib/utils"
import { useMemo } from "react"
import { ScraperPanelTrigger } from "./notifications"
import { CheckCheck, List } from "lucide-react"
import { usePatch } from "@/hooks/api/usePatch"
import { Separator } from "../shadcn/separator"
import { useView } from "@/providers/view.provider"
import { Label } from "../shadcn/label"

export function Dashboard() {
  //TODO: view split into two sections: recently executed scrapers and unread notifications; recently executed scraper will also show its last execution info

  const { setView } = useView()

  const {
    data: unreadNotifications,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/notifications", undefined, { read: false })

  const { patchItem: markAllAsRead, isPatching: isMarkingAllAsRead } = usePatch(
    "/notifications/read-all",
  )

  const notificationsColumns = useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Notification",
        cell: ({ row }) => {
          const notification = row.original
          let content: React.ReactNode
          switch (notification.type) {
            case NotificationType.ScraperFinished:
              content = (
                <ScraperPanelTrigger
                  scraperId={notification.scraperId}
                  notificationId={notification.id}
                  onMarkAsRead={refresh}
                  className="whitespace-normal"
                >
                  Scraper <b>{notification.scraperName}</b> has finished after{" "}
                  {notification.iterations} iterations.
                </ScraperPanelTrigger>
              )
              break
            default:
              content = <pre>{JSON.stringify(notification, null, 2)}</pre>
          }
          return <div className="whitespace-normal">{content}</div>
        },
      },
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [refresh],
  )

  return (
    <div className="w-full h-full overflow-hidden grid xl:grid-cols-[1fr_1px_minmax(auto,calc(var(--spacing)*170))] xl:grid-rows-[100%]">
      <div data-transition-direction="left" className="view-transition">
        1
      </div>
      <Separator orientation="vertical" className="view-transition delay-100" />
      <div
        data-transition-direction="right"
        className="view-transition flex flex-col overflow-hidden"
      >
        <div className="flex flex-row items-center justify-between gap-2 p-2">
          <Label className="text-muted-foreground font-semibold text-lg">
            Unread notifications
          </Label>
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || isLoadingMore || isMarkingAllAsRead}
              onClick={() => {
                void markAllAsRead({}).then(() => {
                  refresh()
                })
              }}
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              onClick={() => setView(useView.View.Notifications)}
            >
              <List />
              See all
            </Button>
          </div>
        </div>

        <DataTable
          data-transition-direction="left"
          className="h-auto overflow-hidden"
          columns={notificationsColumns}
          data={unreadNotifications}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  )
}
