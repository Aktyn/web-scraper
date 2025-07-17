import { LabeledValue } from "@/components/common/label/labeled-value"
import { scraperValueTypeLabels } from "@/lib/dictionaries"
import { ScraperValueType, type ScraperValue } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { DataKeyValue } from "../instruction-types/data-key-value.js"
import { ScraperSelector } from "../instruction-types/scraper-selector.js"
import { Badge } from "@/components/shadcn/badge"
import { cn } from "@/lib/utils"
import { palette } from "@/lib/palette"

type ScraperValueProps = {
  value: ScraperValue
}

export function ScraperValue({ value }: ScraperValueProps) {
  const pageIndex =
    value.type === ScraperValueType.ElementTextContent ||
    value.type === ScraperValueType.ElementAttribute
      ? value.pageIndex
      : undefined

  const tabColor = palette[(pageIndex ?? 0) % palette.length]

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-sm p-2 flex flex-col gap-2",
        pageIndex ? "relative" : "bg-background-lighter",
      )}
      style={
        tabColor !== palette[0] ? { borderColor: `${tabColor}50` } : undefined
      }
    >
      {!!pageIndex && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `${tabColor}04` }}
        />
      )}
      <div className="flex items-center gap-2">
        <DynamicIcon name={iconsMap[value.type]} className="size-4" />
        <span className="text-sm font-medium leading-none">
          {scraperValueTypeLabels[value.type]}
        </span>
        {!!pageIndex && (
          <Badge variant="outline" className="text-muted-foreground">
            page: {pageIndex + 1}
          </Badge>
        )}
      </div>
      <ValueDetails value={value} />
    </div>
  )
}

const iconsMap: { [key in ScraperValueType]: IconName } = {
  [ScraperValueType.Literal]: "code",
  [ScraperValueType.Null]: "circle-slash",
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
          <pre className="break-words whitespace-normal">{value.value}</pre>
        </LabeledValue>
      )

    case ScraperValueType.Null:
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
              <pre className="text-sm rounded break-words whitespace-normal">
                {value.defaultValue}
              </pre>
            </LabeledValue>
          )}
        </div>
      )

    case ScraperValueType.ElementTextContent:
      return (
        <LabeledValue label="Element:">
          <ScraperSelector selectors={value.selectors} />
        </LabeledValue>
      )

    case ScraperValueType.ElementAttribute:
      return (
        <div className="space-y-2">
          <LabeledValue label="Element:">
            <ScraperSelector selectors={value.selectors} />
          </LabeledValue>
          <LabeledValue label="Attribute:">
            <pre className="text-sm break-words whitespace-normal">
              {value.attributeName}
            </pre>
          </LabeledValue>
        </div>
      )
  }
}
