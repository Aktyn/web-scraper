import { cn } from "@/lib/utils"
import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import type { ComponentProps } from "react"
import { ScraperExecutionInfoItem } from "./scraper-execution-info-item"

type ScraperExecutionInfoProps = ComponentProps<"div"> & {
  executionInfo: ScraperInstructionsExecutionInfo
}

export function ScraperExecutionInfo({
  executionInfo,
  ...divProps
}: ScraperExecutionInfoProps) {
  return (
    <div
      {...divProps}
      className={cn(
        "flex flex-row items-stretch gap-2 px-6 pb-3",
        divProps.className,
      )}
    >
      {executionInfo.map((executionInfo, index) => (
        <ScraperExecutionInfoItem
          key={index}
          // data-index={index}
          executionInfo={executionInfo}
        />
      ))}
    </div>
  )
}
