import { cn } from "@/lib/utils"
import {
  ElementSelectorType,
  type ScraperElementSelector,
} from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { type ComponentProps } from "react"
import { ScraperElementSelectorInfo } from "../common/scraper-element-selector-info"

type ScraperSelectorProps = {
  selector: ScraperElementSelector
} & ComponentProps<"div">

export function ScraperSelector({
  selector,
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
      <div className="flex items-center gap-2">
        <DynamicIcon name={iconsMap[selector.type]} className="size-4" />
        <span className="text-sm font-medium capitalize leading-none">
          {selector.type}
        </span>
      </div>
      <ScraperElementSelectorInfo selector={selector} />
    </div>
  )
}

const iconsMap: { [key in ElementSelectorType]: IconName } = {
  [ElementSelectorType.Query]: "search",
  [ElementSelectorType.FindByTextContent]: "type",
}
