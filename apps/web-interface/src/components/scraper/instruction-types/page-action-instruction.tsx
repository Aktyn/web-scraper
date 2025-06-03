import { PageActionType, type PageAction } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import type { ComponentProps } from "react"
import { ScraperSelector } from "./scraper-selector"
import { ScraperValue } from "./scraper-value"
import { LabeledValue } from "@/components/common/labeled-value"
import { CopyButton } from "@/components/common/button/copy-button"
import { Check, ExternalLink } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { formatDuration } from "@/lib/utils"

type PageActionInstructionProps = {
  action: PageAction
} & ComponentProps<"div">

export function PageActionInstruction({
  action,
  ...divProps
}: PageActionInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <DynamicIcon name={iconsMap[action.type]} className="size-4" />
        <span className="font-medium capitalize leading-none">
          {action.type}
        </span>
      </div>
      <ActionDetails action={action} />
    </div>
  )
}

const iconsMap: { [key in PageActionType]: IconName } = {
  [PageActionType.Wait]: "clock",
  [PageActionType.Navigate]: "navigation",
  [PageActionType.Click]: "mouse-pointer-click",
  [PageActionType.Type]: "type",
}

function ActionDetails({ action }: { action: PageAction }) {
  switch (action.type) {
    case PageActionType.Wait:
      return (
        <LabeledValue label="Duration">
          {formatDuration(action.duration)}
        </LabeledValue>
      )

    case PageActionType.Navigate:
      return (
        <LabeledValue label="URL">
          <div className="flex flex-row items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {action.url}
                </a>
              </TooltipTrigger>
              <TooltipContent className="leading-none">
                Click to open URL in new tab&ensp;
                <ExternalLink className="size-3.5 inline" />
              </TooltipContent>
            </Tooltip>
            <CopyButton value={action.url} className="size-6" />
          </div>
        </LabeledValue>
      )

    case PageActionType.Click:
      return (
        <LabeledValue label="Target:">
          <ScraperSelector selector={action.selector} />
        </LabeledValue>
      )

    case PageActionType.Type:
      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <LabeledValue label="Target:">
            <ScraperSelector selector={action.selector} />
          </LabeledValue>
          <LabeledValue label="Value:">
            <ScraperValue value={action.value} />
          </LabeledValue>
          {!action.clearBeforeType && (
            <LabeledValue
              label="Clear before typing:"
              className="w-full flex-row items-center gap-x-2"
            >
              <Check className="size-4 text-success" />
            </LabeledValue>
          )}
        </div>
      )
  }
}
