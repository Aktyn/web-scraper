import { cn, formatDateTime, formatDuration } from "@/lib/utils"
import { SchedulerType, type Scheduler } from "@web-scraper/common"
import { isPast } from "date-fns"
import type { ComponentProps } from "react"

type SchedulerInfoProps = ComponentProps<"div"> & {
  scheduler: Scheduler
}

export function SchedulerInfo({ scheduler, ...divProps }: SchedulerInfoProps) {
  switch (scheduler.type) {
    default:
      return null
    case SchedulerType.Interval:
      return (
        <div
          {...divProps}
          className={cn("*:[b]:whitespace-nowrap", divProps.className)}
        >
          Every&nbsp;<b>{formatDuration(scheduler.interval)}</b> from&nbsp;
          <b
            className={cn(
              !isPast(scheduler.startAt) && "text-muted-foreground",
            )}
          >
            {formatDateTime(scheduler.startAt)}
          </b>
          {typeof scheduler.endAt === "number" && (
            <>
              {" "}
              to&nbsp;
              <b
                className={cn(
                  isPast(scheduler.endAt) && "text-muted-foreground",
                )}
              >
                {formatDateTime(scheduler.endAt)}
              </b>
            </>
          )}
        </div>
      )
  }
}
