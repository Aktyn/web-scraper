import { Button } from "@/components/shadcn/button"
import { usePost } from "@/hooks/api/usePost"
import { cn } from "@/lib/utils"
import {
  ScraperInstructionsExecutionInfoType,
  ScraperState,
} from "@web-scraper/common"
import { LoaderCircle, MonitorX } from "lucide-react"

type ScraperStateWidgetProps = {
  scraperId: number
  state: ScraperState
  result?: ScraperInstructionsExecutionInfoType
}

export function ScraperStateWidget({
  scraperId,
  state,
  result,
}: ScraperStateWidgetProps) {
  const { postItem: terminate, isPosting: terminating } = usePost(
    "/scrapers/:id/terminate",
    {
      successMessage: "Scraper terminated",
      errorMessage: "Failed to terminate scraper",
    },
  )

  switch (state) {
    case ScraperState.Pending:
    case ScraperState.Idle:
      return <LoaderCircle className="animate-spin inline" />

    case ScraperState.Executing:
      return (
        <div className="w-full grid grid-cols-[8rem_auto_8rem] grid-rows-1 items-center justify-stretch gap-2">
          <div className="col-start-2 grid grid-cols-[1fr_auto_1fr] grid-rows-1 items-center gap-2">
            <AnimatedLine />
            <span className="text-primary font-semibold text-shadow-[0_0_0.5rem] text-shadow-primary/50">
              Executing
            </span>
            <AnimatedLine reverse />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-end"
            disabled={terminating}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()

              terminate(null, { id: scraperId }).catch(console.error)
            }}
          >
            <MonitorX />
            Terminate
          </Button>
        </div>
      )

    case ScraperState.Exited:
      return (
        <span
          className={cn(
            "text-warning font-semibold",
            result === ScraperInstructionsExecutionInfoType.Success &&
              "text-success",
            result === ScraperInstructionsExecutionInfoType.Error &&
              "text-destructive",
          )}
        >
          Scraper exited with{" "}
          <u>
            {result === ScraperInstructionsExecutionInfoType.Success
              ? "success"
              : result === ScraperInstructionsExecutionInfoType.Error
                ? "error"
                : "unknown result"}
          </u>
        </span>
      )

    default:
      return null
  }
}

const AnimatedLine = ({ reverse }: { reverse?: boolean }) => (
  <div className="relative h-[2px] overflow-hidden rounded-full">
    <div
      className={cn(
        "absolute h-full my-auto w-[200%] bg-linear-90 from-transparent from-15% via-primary to-transparent to-85% animate-in repeat-infinite duration-1000 ease-in-out direction-alternate",
        reverse
          ? "slide-in-from-right-[50%] right-0"
          : "slide-in-from-left-[50%] left-0",
      )}
    />
  </div>
)
