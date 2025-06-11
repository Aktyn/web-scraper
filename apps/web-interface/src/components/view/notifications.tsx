import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { type Notification, NotificationType } from "@web-scraper/common"
import { useMemo } from "react"
import { DataTable } from "../common/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { RefreshButton } from "../common/table/refresh-button"
import { Button } from "../shadcn/button"
import { Check, CheckCheck, Trash } from "lucide-react"
import { usePatch } from "@/hooks/api/usePatch"
import { useDelete } from "@/hooks/api/useDelete"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { cn, formatDateTime } from "@/lib/utils"

export function Notifications() {
  const {
    data: notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/notifications")

  const { patchItem: markAsRead } = usePatch("/notifications/:id/read")
  const { patchItem: markAllAsRead, isPatching: isMarkingAllAsRead } = usePatch(
    "/notifications/read-all",
  )
  const { deleteItem } = useDelete("/notifications/:id")

  const hasUnread = useMemo(
    () => notifications.some((n) => !n.read),
    [notifications],
  )

  const columns = useMemo<ColumnDef<Notification>[]>(
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
                // TODO: open scraper panel on click
                <span>
                  Scraper <b>{notification.scraperName}</b> has finished after{" "}
                  {notification.iterations} iterations.
                </span>
              )
              break
            default:
              content = <pre>{JSON.stringify(notification, null, 2)}</pre>
          }
          return (
            <div className={cn(!notification.read && "text-info")}>
              {content}
            </div>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => (
          <div
            className={cn(
              !row.original.read ? "text-info" : "text-muted-foreground",
            )}
          >
            {formatDateTime(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 max-w-32">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={row.original.read}
                  onClick={(event) => {
                    event.stopPropagation()
                    void markAsRead({}, { id: row.original.id }).then(() =>
                      refresh(),
                    )
                  }}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as read</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation()
                    void deleteItem({ id: row.original.id }).then(() =>
                      refresh(),
                    )
                  }}
                >
                  <Trash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete notification</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [markAsRead, deleteItem, refresh],
  )

  return (
    <div className="size-full *:w-256 *:max-w-full">
      <div
        data-transition-direction="top"
        className="view-transition p-2 flex flex-row items-center gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          disabled={
            !hasUnread || isLoading || isLoadingMore || isMarkingAllAsRead
          }
          onClick={() => {
            void markAllAsRead({}).then(() => {
              refresh()
            })
          }}
        >
          <CheckCheck className="size-4" />
          Mark all as read
        </Button>
        <RefreshButton
          onClick={refresh}
          refreshing={isLoading || isLoadingMore}
        />
      </div>
      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100"
        columns={columns}
        data={notifications}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}
