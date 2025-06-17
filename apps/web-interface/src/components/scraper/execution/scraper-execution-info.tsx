import { cn } from "@/lib/utils"
import {
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import { Loader2 } from "lucide-react"
import { type ComponentProps } from "react"
import { InstructionBlock } from "../instruction-block"
import {
  ScraperExecutionInfoContainer,
  ScraperExecutionInfoHeader,
  ScraperExecutionInfoItem,
} from "./scraper-execution-info-item"

type ScraperExecutionInfoProps = ComponentProps<"div"> & {
  executionInfo: ScraperInstructionsExecutionInfo
  currentlyExecutingInstruction?: ScraperInstructions[number] | null
}

export function ScraperExecutionInfo({
  executionInfo,
  currentlyExecutingInstruction,
  ...divProps
}: ScraperExecutionInfoProps) {
  return (
    <div
      {...divProps}
      className={cn(
        "flex flex-row items-start gap-2 px-6 pb-3",
        divProps.className,
      )}
    >
      {executionInfo.map((executionInfo, index) => (
        <ScraperExecutionInfoItem key={index} executionInfo={executionInfo} />
      ))}
      {currentlyExecutingInstruction && (
        <ScraperExecutionInfoContainer className="text-sm border border-primary border-dashed">
          <ScraperExecutionInfoHeader>
            <Loader2 className="animate-spin ease-in-out inline size-5" />
            Executing instruction
          </ScraperExecutionInfoHeader>
          <InstructionBlock instruction={currentlyExecutingInstruction} />
        </ScraperExecutionInfoContainer>
      )}
    </div>
  )
}
