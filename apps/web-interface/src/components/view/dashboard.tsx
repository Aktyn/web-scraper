import { useGet } from "@/hooks/api/useGet"
import { useInfiniteGet } from "@/hooks/api/useInfiniteGet"
import { usePatch } from "@/hooks/api/usePatch"
import { cn, formatDateTime, formatDuration } from "@/lib/utils"
import { ScraperProvider } from "@/providers/scraper.provider"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import { useView } from "@/providers/view.provider"
import type { ColumnDef } from "@tanstack/react-table"
import type { Notification, ScraperType } from "@web-scraper/common"
import {
  NotificationType,
  ScraperEventType,
  ScraperState,
  SubscriptionMessageType,
} from "@web-scraper/common"
import { CheckCheck, List, Loader2, Play } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { LabeledValue } from "../common/label/labeled-value"
import { DataTable } from "../common/table/data-table"
import { ExecutionResultInfo } from "../scraper/execution/execution-result-info"
import { getExecutionInfoDuration } from "../scraper/execution/helpers"
import { IteratorBadge } from "../scraper/execution/iterator-badge"
import { ScraperStateWidget } from "../scraper/execution/scraper-state-widget"
import { ScraperPanelDialog } from "../scraper/scraper-panel-dialog"
import { Button } from "../shadcn/button"
import { Label } from "../shadcn/label"
import { Separator } from "../shadcn/separator"
import { Skeleton } from "../shadcn/skeleton"
import { ScraperPanelTrigger } from "./notifications"
import { ScrollArea } from "../shadcn/scroll-area"

export function Dashboard() {
  return (
    <div className="w-full h-full overflow-hidden grid 2xl:grid-cols-[1fr_1px_minmax(auto,calc(var(--spacing)*170))] 2xl:grid-rows-[100%] max-2xl:grid-cols-1 max-2xl:grid-rows-[1fr_1px_1fr] 2xl:[:has(>div[data-empty=true])]:grid-cols-[1fr_1px_minmax(auto,calc(var(--spacing)*118))] max-2xl:[:has(>div[data-empty=true])]:grid-rows-[1fr_1px_calc(var(--spacing)*64)] transition-[grid-template-columns,grid-template-rows]">
      <RecentlyExecutedScrapers />
      <Separator
        orientation="vertical"
        className="view-transition delay-100 max-2xl:hidden"
      />
      <Separator className="view-transition delay-100 min-2xl:hidden" />
      <UnreadNotifications />
    </div>
  )
}

function RecentlyExecutedScrapers() {
  const { setView } = useView()

  const {
    data: scrapers,
    isLoading,
    refetch,
  } = useGet("/scrapers", undefined, {
    pageSize: 16,
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
        ].includes(message.event.type)
      ) {
        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current)
        }

        refreshTimeout.current = setTimeout(() => {
          refetch()
          refreshTimeout.current = null
        }, 16)
      }
    },
  )

  const [scraperViewOpen, setScraperViewOpen] = useState(false)
  const [scraperToView, setScraperToView] = useState<ScraperType | null>(null)

  return (
    <>
      <div
        data-transition-direction="left"
        className="view-transition grid grid-rows-[auto_1fr] overflow-hidden"
      >
        <div className="flex flex-row items-center justify-between gap-2 p-2">
          <Label className="text-muted-foreground font-semibold text-lg">
            Recent scrapers
          </Label>
          <Button
            variant="ghost"
            onClick={() => setView(useView.View.Scrapers)}
          >
            <List />
            See all
          </Button>
        </div>
        {isLoading && !scrapers?.data ? (
          <Loader2 className="size-4 animate-spin mx-2" />
        ) : scrapers?.data.length ? (
          <ScrollArea className="overflow-hidden">
            <div className="p-3 gap-3 grid grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*96),1fr))]">
              {scrapers.data.map((scraper) => (
                <ScraperProvider key={scraper.id} scraper={scraper}>
                  <ScraperCard
                    key={scraper.id}
                    onClick={() => {
                      setScraperToView(scraper)
                      setScraperViewOpen(true)
                    }}
                  />
                </ScraperProvider>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-muted-foreground px-2">No scrapers found</div>
        )}
      </div>

      {scraperToView && (
        <ScraperPanelDialog
          scraper={scraperToView}
          open={scraperViewOpen}
          onOpenChange={(openState) => {
            setScraperViewOpen(openState)
            if (!openState) {
              refetch()
            }
          }}
        />
      )}
    </>
  )
}

type ScraperCardProps = {
  onClick: () => void
}

function ScraperCard({ onClick }: ScraperCardProps) {
  const {
    scraper,
    execute,
    sendingExecutionRequest,
    state,
    partialExecutionInfo,
  } = ScraperProvider.useContext()

  const {
    data: executions,
    isLoading,
    refetch,
  } = useGet("/scrapers/executions", undefined, {
    id: scraper.id,
    pageSize: 1,
    page: 0,
  })

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null)

  ServerEventsProvider.useMessages(
    SubscriptionMessageType.ScraperEvent,
    (message) => {
      if (
        message.scraperId === scraper.id &&
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
          refetch()
          refreshTimeout.current = null
        }, 16)
      }
    },
  )

  const lastExecution = executions?.data.at(0)

  const totalDuration = lastExecution
    ? lastExecution.iterations.reduce((acc, iteration) => {
        return acc + getExecutionInfoDuration(iteration.executionInfo)
      }, 0)
    : 0

  const canRepeatLastExecution =
    !isLoading &&
    !!lastExecution &&
    !sendingExecutionRequest &&
    (!state || state === ScraperState.Exited)

  return (
    <div
      className="bg-card hover:bg-background-lighter border rounded-lg p-2 shadow-lg transition-colors cursor-pointer flex flex-col items-center gap-2 **:[label]:cursor-[inherit]"
      onClick={onClick}
    >
      <Label className="text-lg">{scraper.name}</Label>
      <div className="bg-background-lighter rounded-md p-2 w-full grow flex items-center justify-center">
        {isLoading || !executions?.data ? (
          <Skeleton className="h-24 w-full" />
        ) : lastExecution ? (
          <div className="flex flex-row flex-wrap justify-center items-start gap-y-2 gap-x-4 text-sm">
            <div className="flex flex-row items-center justify-center gap-2 w-full">
              <Label>Last execution:</Label>
              <ExecutionResultInfo
                executionInfos={lastExecution.iterations.flatMap(
                  (it) => it.executionInfo.at(-1) ?? [],
                )}
              />
            </div>
            <LabeledValue label="Last execution at">
              {formatDateTime(lastExecution.createdAt)}
            </LabeledValue>
            <LabeledValue label="Total duration">
              {formatDuration(totalDuration, "second")}
            </LabeledValue>
            <LabeledValue label="Iterations">
              <div className="flex flex-row items-center gap-2">
                <span>{lastExecution.iterations.length}</span>
                <IteratorBadge iterator={lastExecution.iterator} />
              </div>
            </LabeledValue>
          </div>
        ) : (
          <Label className="text-muted-foreground text-sm">
            No executions yet
          </Label>
        )}
      </div>
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(
          canRepeatLastExecution
            ? "hover:text-primary"
            : "pointer-events-none opacity-50",
          "w-full mt-auto",
        )}
        disabled={!canRepeatLastExecution}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()

          if (!state || state === ScraperState.Exited) {
            execute(lastExecution?.iterator ?? null).catch(console.error)
          }
        }}
      >
        <div>
          {!state || state === ScraperState.Exited ? (
            <>
              <Play />
              Repeat last execution
            </>
          ) : (
            <ScraperStateWidget
              scraperId={scraper.id}
              state={state}
              result={partialExecutionInfo.at(-1)?.type}
            />
          )}
        </div>
      </Button>
    </div>
  )
}

function UnreadNotifications() {
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

  ServerEventsProvider.useMessages(SubscriptionMessageType.Notification, () =>
    refresh(),
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
          return <div className="whitespace-normal">{content}</div>
        },
      },
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  )

  return (
    <div
      data-transition-direction="right"
      data-empty={
        !unreadNotifications?.length && !isLoading && !isLoadingMore && !hasMore
      }
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
        noDataMessage="No unread notifications"
      />
    </div>
  )
}
