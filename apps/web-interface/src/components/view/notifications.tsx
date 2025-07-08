import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import {
  type Notification,
  NotificationType,
  SubscriptionMessageType,
} from "@web-scraper/common"
import type { ComponentProps, ReactNode } from "react"
import { useMemo, useState } from "react"
import { DataTable } from "../common/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { RefreshButton } from "../common/table/refresh-button"
import { Button } from "../shadcn/button"
import { Check, CheckCheck, Loader2, Trash } from "lucide-react"
import { usePatch } from "@/hooks/api/usePatch"
import { useDelete } from "@/hooks/api/useDelete"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { cn, formatDateTime } from "@/lib/utils"
import { ScraperPanelDialog } from "../scraper/scraper-panel-dialog"
import { useGet } from "@/hooks/api/useGet"
import { ServerEventsProvider } from "@/providers/server-events.provider"

export function Notifications() {
  const {
    data: notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteGet("/notifications")

  const { patchItem: markAllAsRead, isPatching: isMarkingAllAsRead } = usePatch(
    "/notifications/read-all",
  )

  ServerEventsProvider.useMessages(SubscriptionMessageType.Notification, () =>
    refresh(),
  )

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
          let content: ReactNode
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
                  {notification.iterations} iteration
                  {notification.iterations !== 1 ? "s" : ""}.
                </ScraperPanelTrigger>
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
          <NotificationActions
            notification={row.original}
            onMarkAsRead={refresh}
            onDelete={refresh}
          />
        ),
      },
    ],
    [refresh],
  )

  return (
    <div className="size-full *:w-256 *:max-w-full flex flex-col">
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
        className="view-transition delay-100 h-auto overflow-hidden"
        columns={columns}
        data={notifications}
        isLoading={isLoading || isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}

type ScraperPanelTriggerProps = {
  scraperId: number
  notificationId: number
  onMarkAsRead?: () => void
} & ComponentProps<"div">

export function ScraperPanelTrigger({
  scraperId,
  notificationId,
  onMarkAsRead,
  children,
  ...props
}: ScraperPanelTriggerProps) {
  const [loadScraper, setLoadScraper] = useState(false)
  const [scraperViewOpen, setScraperViewOpen] = useState(false)

  const { data: scraperToView, isLoading: isLoadingScraperToView } =
    useGet<"scrapers/:id">(scraperId && loadScraper ? "/scrapers/:id" : null, {
      id: scraperId,
    })

  const { patchItem: markAsRead } = usePatch("/notifications/:id/read", {
    successMessage: null,
  })

  return (
    <>
      <div
        {...props}
        className={cn("hover:text-primary cursor-pointer", props.className)}
        onClick={(event) => {
          if (!isLoadingScraperToView) {
            if (!loadScraper) {
              setLoadScraper(true)
              if (onMarkAsRead) {
                void markAsRead({}, { id: notificationId }).then(() => {
                  onMarkAsRead()
                })
              }
            }
            setScraperViewOpen(true)
          }
          props.onClick?.(event)
        }}
      >
        {isLoadingScraperToView && (
          <Loader2 className="size-4 animate-spin inline mr-2 opacity-100 starting:mr-0 starting:opacity-0 transition-[margin-right,opacity]" />
        )}
        {children}
      </div>
      {scraperToView && (
        <ScraperPanelDialog
          scraper={scraperToView.data}
          open={scraperViewOpen && scraperToView.data.id === scraperId}
          onOpenChange={setScraperViewOpen}
        />
      )}
    </>
  )
}

type NotificationActionsProps = {
  notification: Notification
  onMarkAsRead: () => void
  onDelete: () => void
}

function NotificationActions({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationActionsProps) {
  const { patchItem: markAsRead, isPatching: isMarkingAsRead } = usePatch(
    "/notifications/:id/read",
  )
  const { deleteItem, isDeleting } = useDelete("/notifications/:id")

  return (
    <div className="flex items-center gap-1 max-w-32">
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={notification.read || isMarkingAsRead}
            onClick={(event) => {
              event.stopPropagation()
              void markAsRead({}, { id: notification.id }).then(() =>
                onMarkAsRead(),
              )
            }}
          >
            {isMarkingAsRead ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mark as read</TooltipContent>
      </Tooltip>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation()
              void deleteItem({ id: notification.id }).then(() => onDelete())
            }}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete notification</TooltipContent>
      </Tooltip>
    </div>
  )
}
