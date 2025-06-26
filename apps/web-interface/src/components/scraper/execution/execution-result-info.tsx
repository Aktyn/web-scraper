import { NullBadge } from "@/components/common/null-badge"
import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import { ScraperInstructionsExecutionInfoType } from "@web-scraper/common"
import { Check, X } from "lucide-react"

type ExecutionResultInfoProps = {
  executionInfos: ScraperInstructionsExecutionInfo
}

export function ExecutionResultInfo({
  executionInfos,
}: ExecutionResultInfoProps) {
  if (!executionInfos.length) {
    return <NullBadge />
  }

  const successCount = executionInfos.reduce((acc, info) => {
    if (info.type === ScraperInstructionsExecutionInfoType.Success) {
      return acc + 1
    }
    return acc
  }, 0)

  const errorCount = executionInfos.reduce((acc, info) => {
    if (info.type === ScraperInstructionsExecutionInfoType.Error) {
      return acc + 1
    }
    return acc
  }, 0)

  if (successCount > 0 && errorCount === 0) {
    return (
      <span className="text-success">
        <Check className="size-4 inline" /> Success
      </span>
    )
  } else if (errorCount > 0 && successCount === 0) {
    return (
      <span className="text-destructive">
        <X className="size-4 inline" /> Error
      </span>
    )
  } else {
    return (
      <div className="flex flex-row items-center gap-2">
        <span className="text-success">
          <Check className="size-4 inline" /> {successCount}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-destructive">
          <X className="size-4 inline" /> {errorCount}
        </span>
      </div>
    )
  }
}
