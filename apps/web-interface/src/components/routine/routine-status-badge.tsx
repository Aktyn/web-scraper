import { routineStatusLabels } from "@/lib/dictionaries"
import { RoutineStatus } from "@web-scraper/common"
import { Badge } from "../shadcn/badge"
import { cn } from "@/lib/utils"

type RoutineStatusBadgeProps = {
  status: RoutineStatus
  className?: string
}

export function RoutineStatusBadge({
  status,
  className,
}: RoutineStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-normal",
        status === RoutineStatus.Executing &&
          "bg-primary text-primary-foreground border-primary",
        status === RoutineStatus.Paused && "bg-info/20 text-info border-info",
        status === RoutineStatus.PausedDueToMaxNumberOfFailedExecutions &&
          "bg-destructive/20 text-destructive border-destructive",
        className,
      )}
    >
      {routineStatusLabels[status]}
    </Badge>
  )
}
