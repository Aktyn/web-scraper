import { PageActionType, type PageAction } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import type { ComponentProps } from "react"
import { PageActionDetails } from "../common/page-action-details"

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
      <PageActionDetails action={action} />
    </div>
  )
}

const iconsMap: { [key in PageActionType]: IconName } = {
  [PageActionType.Wait]: "clock",
  [PageActionType.Navigate]: "navigation",
  [PageActionType.Click]: "mouse-pointer-click",
  [PageActionType.Type]: "type",
}
