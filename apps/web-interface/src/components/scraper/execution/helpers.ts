import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import { ScraperInstructionsExecutionInfoType } from "@web-scraper/common"

export function getExecutionInfoDuration(
  executionInfo: ScraperInstructionsExecutionInfo,
) {
  const lastExecutionInfo = executionInfo.at(-1)
  if (
    lastExecutionInfo?.type === ScraperInstructionsExecutionInfoType.Success ||
    lastExecutionInfo?.type === ScraperInstructionsExecutionInfoType.Error
  ) {
    return lastExecutionInfo.summary.duration
  }
  return 0
}
