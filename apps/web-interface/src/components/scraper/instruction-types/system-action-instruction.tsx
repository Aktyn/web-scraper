import { LabeledValue } from "@/components/common/label/labeled-value"
import { systemActionTypeLabels } from "@/lib/dictionaries"
import type { SystemAction } from "@web-scraper/common"
import { SystemActionType } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import type { ComponentProps } from "react"

type SystemActionInstructionProps = {
  systemAction: SystemAction
} & ComponentProps<"div">

export function SystemActionInstruction({
  systemAction,
  ...divProps
}: SystemActionInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <DynamicIcon name={iconsMap[systemAction.type]} className="size-4" />
        <span className="font-medium leading-none">
          {systemActionTypeLabels[systemAction.type]}
        </span>
      </div>
      <SystemActionDetails systemAction={systemAction} />
    </div>
  )
}

const iconsMap: { [key in SystemActionType]: IconName } = {
  [SystemActionType.ShowNotification]: "bell-plus",
}

function SystemActionDetails({ systemAction }: { systemAction: SystemAction }) {
  switch (systemAction.type) {
    case SystemActionType.ShowNotification:
      return <LabeledValue label="Message">{systemAction.message}</LabeledValue>
  }
}
