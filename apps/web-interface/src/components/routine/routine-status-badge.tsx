import { routineStatusLabels } from "@/lib/dictionaries"
import { RoutineStatus } from "@web-scraper/common"
import { Badge } from "../shadcn/badge"
import { cn } from "@/lib/utils"

export function RoutineStatusBadge({ status }: { status: RoutineStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === RoutineStatus.Executing &&
          "bg-primary text-primary-foreground border-primary",
        status === RoutineStatus.Paused && "bg-info/20 text-info border-info",
        status === RoutineStatus.PausedDueToMaxNumberOfFailedExecutions &&
          "bg-destructive/20 text-destructive border-destructive",
      )}
    >
      {routineStatusLabels[status]}
    </Badge>
  )
}
