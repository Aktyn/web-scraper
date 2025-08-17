import { LabeledValue } from "@/components/common/label/labeled-value"
import { useGet } from "@/hooks/api/useGet"
import { formatDateTime } from "@/lib/utils"
import { RoutineStatus, type Routine } from "@web-scraper/common"
import { CalendarClock, Play, SquareStack, TrafficCone } from "lucide-react"
import { useState } from "react"
import { ScraperIcon } from "../icons/scraper-icon"
import { IteratorDescription } from "../iterator/iterator-description"
import { ScraperPanelDialog } from "../scraper/scraper-panel-dialog"
import { Button } from "../shadcn/button"
import { RoutineStatusBadge } from "./routine-status-badge"
import { SchedulerInfo } from "./scheduler-info"
import { usePost } from "@/hooks/api/usePost"
import { Countdown } from "../common/label/countdown"
import { TermInfo } from "../info/term-info"

type RoutinePanelProps = {
  routine: Routine
  onRoutineExecuted: (updatedRoutine: Routine) => void
}

export function RoutinePanel({
  routine,
  onRoutineExecuted,
}: RoutinePanelProps) {
  const { data: scraper } = useGet("/scrapers/:id", { id: routine.scraperId })
  const { postItem: runRoutine } = usePost("/routines/:id/execute", {
    successMessage: "Routine executed",
    errorMessage: "Failed to execute routine",
  })

  const [scraperViewOpen, setScraperViewOpen] = useState(false)

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-row flex-wrap items-start gap-4">
        <LabeledValue label="Status">
          <RoutineStatusBadge status={routine.status} />
        </LabeledValue>
        <LabeledValue
          label={
            <div className="flex flex-row items-center gap-1">
              <span>Iterator</span>
              <TermInfo term="iterator" className="size-3.5" />
            </div>
          }
        >
          <IteratorDescription
            iterator={routine.iterator}
            className="whitespace-normal"
          />
        </LabeledValue>
      </div>

      <LabeledValue label="Scheduler">
        <SchedulerInfo scheduler={routine.scheduler} />
      </LabeledValue>

      {routine.status === RoutineStatus.Active && (
        <LabeledValue label="Next scheduled execution date">
          <div className="flex flex-row items-center gap-2">
            {routine.nextScheduledExecutionAt ? (
              <div className="flex flex-row items-baseline gap-1">
                {formatDateTime(routine.nextScheduledExecutionAt)}
                {routine.nextScheduledExecutionAt < Date.now() + 120_000 && (
                  <span className="text-sm text-muted-foreground">
                    (<Countdown timestamp={routine.nextScheduledExecutionAt} />)
                  </span>
                )}
              </div>
            ) : (
              "No more executions scheduled"
            )}
            <Button
              variant="outline"
              size="sm"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()

                runRoutine(null, { id: routine.id })
                  .then((res) => {
                    if (res?.data) {
                      onRoutineExecuted(res.data)
                    }
                  })
                  .catch(console.error)
              }}
            >
              <Play />
              Run now
            </Button>
          </div>
        </LabeledValue>
      )}

      <div className="flex flex-row flex-wrap items-start gap-4">
        {typeof routine.pauseAfterNumberOfFailedExecutions === "number" && (
          <LabeledValue
            label={
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <TrafficCone className="size-4" />
                  <span>Pause after failed executions</span>
                </div>
                <p className="text-xs font-normal text-muted-foreground">
                  Number of failed executions before the routine is paused.
                </p>
              </div>
            }
          >
            {routine.pauseAfterNumberOfFailedExecutions}
          </LabeledValue>
        )}

        <LabeledValue
          label={
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <SquareStack className="size-4" />
                <span>Total executions</span>
              </div>
              <p className="text-xs font-normal text-muted-foreground">
                Number of times the routine has been executed
              </p>
            </div>
          }
        >
          {routine.previousExecutionsCount}
        </LabeledValue>

        {routine.lastExecutionAt && (
          <LabeledValue
            label={
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <CalendarClock className="size-4" />
                  <span>Last execution date</span>
                </div>
                <p className="text-xs font-normal text-muted-foreground">
                  Date and time of the last execution of the routine
                </p>
              </div>
            }
          >
            {formatDateTime(routine.lastExecutionAt)}
          </LabeledValue>
        )}
      </div>

      <div className="flex flex-row flex-wrap items-start gap-4 text-xs text-muted-foreground">
        <LabeledValue label="Created At">
          {formatDateTime(routine.createdAt)}
        </LabeledValue>
        <LabeledValue label="Updated At">
          {formatDateTime(routine.updatedAt)}
        </LabeledValue>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!scraper?.data}
        className="w-auto mr-auto"
        onClick={() => setScraperViewOpen(true)}
      >
        <ScraperIcon />
        Open scraper panel
      </Button>

      {scraper?.data && (
        <ScraperPanelDialog
          scraper={scraper.data}
          open={scraperViewOpen}
          onOpenChange={setScraperViewOpen}
        />
      )}
    </div>
  )
}
