import { LabeledValue } from "@/components/common/label/labeled-value"
import type { ScraperValue } from "@web-scraper/common"
import { Logs } from "lucide-react"
import { ScraperValue as ScraperValueComponent } from "../common/scraper-value"
import type { ComponentProps } from "react"

type SaveDataInstructionProps = {
  value: ScraperValue
} & ComponentProps<"div">

export function LogDataInstruction({
  value,
  ...divProps
}: SaveDataInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Logs className="size-4" />
        <span className="font-medium leading-none">Log data</span>
      </div>

      <LabeledValue label="Value:">
        <ScraperValueComponent value={value} />
      </LabeledValue>
    </div>
  )
}
