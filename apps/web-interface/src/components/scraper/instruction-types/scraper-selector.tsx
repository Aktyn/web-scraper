import { cn } from "@/lib/utils"
import {
  ElementSelectorType,
  type ScraperElementSelectors,
} from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { Fragment, type ComponentProps } from "react"
import { ScraperElementSelectorInfo } from "../common/scraper-element-selector-info"
import { SelectorsSeparator } from "../common/selectors-separator"

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
        "border-2 border-dashed border-secondary/30 rounded-sm p-2 flex flex-col gap-2 bg-background-lighter",
        divProps.className,
      )}
    >
      {selectors.map((selector, index) => (
        <Fragment key={`${selector.type}=${index}`}>
          {index > 0 && <SelectorsSeparator />}
          <div className="flex items-center gap-2">
            <DynamicIcon name={iconsMap[selector.type]} className="size-4" />
            <span className="text-sm font-medium capitalize leading-none">
              {selector.type}
            </span>
          </div>
          <ScraperElementSelectorInfo selector={selector} />
        </Fragment>
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
