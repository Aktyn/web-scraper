import type { ScraperDataKey, ScraperValue } from "@web-scraper/common"
import { Save, Trash2 } from "lucide-react"
import { ScraperValue as ScraperValueComponent } from "./scraper-value"
import type { ComponentProps } from "react"
import { LabeledValue } from "@/components/common/labeled-value"

type SaveDataInstructionProps = {
  dataKey: ScraperDataKey
  value: ScraperValue
} & ComponentProps<"div">

export function SaveDataInstruction({
  dataKey,
  value,
  ...divProps
}: SaveDataInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Save className="size-4" />
        <span className="font-medium leading-none">Save data</span>
      </div>

      <LabeledValue label="Data key:">
        <pre className="break-all whitespace-normal">{dataKey}</pre>
      </LabeledValue>

      <LabeledValue label="Value:">
        <ScraperValueComponent value={value} />
      </LabeledValue>
    </div>
  )
}

type DeleteDataInstructionProps = {
  dataKey: ScraperDataKey
} & ComponentProps<"div">

export function DeleteDataInstruction({
  dataKey,
  ...divProps
}: DeleteDataInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Trash2 className="size-4" />
        <span className="font-medium leading-none">Delete data</span>
      </div>

      <LabeledValue label="Data key:">
        <pre className="break-all whitespace-normal">{dataKey}</pre>
      </LabeledValue>
    </div>
  )
}
