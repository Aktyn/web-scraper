import { LabeledValue } from "@/components/common/labeled-value"
import { scraperValueTypeLabels } from "@/lib/dictionaries"
import { ScraperValueType, type ScraperValue } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { DataKeyValue } from "./data-key-value"
import { ScraperSelector } from "./scraper-selector"

type ScraperValueProps = {
  value: ScraperValue
}

export function ScraperValue({ value }: ScraperValueProps) {
  return (
    <div className="border-2 border-dashed border-primary/30 rounded-sm p-2 flex flex-col gap-2 bg-background-lighter">
      <div className="flex items-center gap-2">
        <DynamicIcon name={iconsMap[value.type]} className="size-4" />
        <span className="text-sm font-medium leading-none">
          {scraperValueTypeLabels[value.type]}
        </span>
      </div>
      <ValueDetails value={value} />
    </div>
  )
}

const iconsMap: { [key in ScraperValueType]: IconName } = {
  [ScraperValueType.Literal]: "code",
  [ScraperValueType.CurrentTimestamp]: "clock",
  [ScraperValueType.ExternalData]: "database",
  [ScraperValueType.ElementTextContent]: "file-text",
  [ScraperValueType.ElementAttribute]: "tag",
}

function ValueDetails({ value }: { value: ScraperValue }) {
  switch (value.type) {
    case ScraperValueType.Literal:
      return (
        <LabeledValue label="Literal value:">
          <pre className="break-all whitespace-normal">{value.value}</pre>
        </LabeledValue>
      )

    case ScraperValueType.CurrentTimestamp:
      return null

    case ScraperValueType.ExternalData:
      return (
        <div className="space-y-2">
          <LabeledValue label="Data key:">
            <DataKeyValue dataKey={value.dataKey} className="text-sm" />
          </LabeledValue>
          {value.defaultValue && (
            <LabeledValue label="Default value:">
              <pre className="text-sm rounded break-all whitespace-normal">
                {value.defaultValue}
              </pre>
            </LabeledValue>
          )}
        </div>
      )

    case ScraperValueType.ElementTextContent:
      return (
        <LabeledValue label="Element:">
          <ScraperSelector selector={value.selector} />
        </LabeledValue>
      )

    case ScraperValueType.ElementAttribute:
      return (
        <div className="space-y-2">
          <LabeledValue label="Element:">
            <ScraperSelector selector={value.selector} />
          </LabeledValue>
          <LabeledValue label="Attribute:">
            <pre className="text-sm break-all whitespace-normal">
              {value.attributeName}
            </pre>
          </LabeledValue>
        </div>
      )
  }
}
