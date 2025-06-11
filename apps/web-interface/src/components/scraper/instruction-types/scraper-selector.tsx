import { selectorTypeLabels } from "@/lib/dictionaries"
import { cn } from "@/lib/utils"
import {
  ElementSelectorType,
  type ScraperElementSelectors,
} from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { type ComponentProps } from "react"
import { ScraperElementSelectorInfo } from "../common/scraper-element-selector-info"

type ScraperSelectorProps = {
  selectors: ScraperElementSelectors
} & ComponentProps<"div">

export function ScraperSelector({
  selectors,
  ...divProps
}: ScraperSelectorProps) {
  return (
    <div
      {...divProps}
      className={cn(
        "border-2 border-dashed border-secondary/30 rounded-sm p-2 flex flex-row justify-start flex-wrap gap-4 bg-background-lighter",
        divProps.className,
      )}
    >
      {selectors.map((selector, index) => (
        <div key={`${selector.type}=${index}`} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DynamicIcon name={iconsMap[selector.type]} className="size-4" />
            <span className="text-sm font-medium leading-none">
              {selectorTypeLabels[selector.type]}
              {selector.type === ElementSelectorType.TextContent &&
                typeof selector.text !== "string" && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (regex)
                  </span>
                )}
            </span>
          </div>
          <ScraperElementSelectorInfo selector={selector} />
        </div>
      ))}
    </div>
  )
}

const iconsMap: { [key in ElementSelectorType]: IconName } = {
  [ElementSelectorType.Query]: "search",
  [ElementSelectorType.TextContent]: "type",
  [ElementSelectorType.TagName]: "tag",
  [ElementSelectorType.Attributes]: "variable",
}
