import type { ScraperDataKey, ScraperValue } from "@web-scraper/common"
import { Save, Trash2 } from "lucide-react"
import { ScraperValue as ScraperValueComponent } from "./scraper-value"
import type { ComponentProps } from "react"
import { LabeledValue } from "@/components/common/labeled-value"
import { DataKeyValue } from "./data-key-value"

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
        <DataKeyValue dataKey={dataKey} />
      </LabeledValue>

      <LabeledValue label="Value:">
        <ScraperValueComponent value={value} />
      </LabeledValue>
    </div>
  )
}

type SaveDataBatchInstructionProps = {
  dataSourceName: string
  items: Array<{ columnName: string; value: ScraperValue }>
} & ComponentProps<"div">

export function SaveDataBatchInstruction({
  dataSourceName,
  items,
  ...divProps
}: SaveDataBatchInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Save className="size-4" />
        <span className="font-medium leading-none">Save data batch</span>
      </div>

      <LabeledValue label="Data source alias:">
        <DataKeyValue dataKey={dataSourceName} />
      </LabeledValue>

      <LabeledValue label="Items (column and value):">
        <div className="flex flex-row flex-wrap items-start gap-2">
          {items.map((item, index) => (
            <div
              key={`${item.columnName}-${index}`}
              className="flex flex-col bg-background p-2 rounded-lg border border-border/50"
            >
              <pre className="font-bold break-words whitespace-normal">
                {item.columnName}
              </pre>
              <ScraperValueComponent value={item.value} />
            </div>
          ))}
        </div>
      </LabeledValue>
    </div>
  )
}

type DeleteDataInstructionProps = {
  dataSourceName: string
} & ComponentProps<"div">

export function DeleteDataInstruction({
  dataSourceName,
  ...divProps
}: DeleteDataInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Trash2 className="size-4" />
        <span className="font-medium leading-none">Delete data</span>
      </div>

      <LabeledValue label="Data source alias:">
        <DataKeyValue dataKey={dataSourceName} />
      </LabeledValue>
    </div>
  )
}
