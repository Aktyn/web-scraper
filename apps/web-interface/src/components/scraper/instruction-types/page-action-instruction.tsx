import type {
  ScraperInstructionInfo,
  ScraperInstructionType,
} from "@web-scraper/common"
import { PageActionType, type PageAction } from "@web-scraper/common"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import type { ComponentProps } from "react"
import { PageActionDetails } from "../common/page-action-details"
import { pageActionTypeLabels } from "@/lib/dictionaries"
import { Badge } from "@/components/shadcn/badge"
import { palette } from "@/lib/palette"
import { cn } from "@/lib/utils"
import { ExternalLink } from "@/components/common/button/external-link"
import { MoveRight } from "lucide-react"
import { LabeledValue } from "@/components/common/label/labeled-value"

type PageUrlType = Extract<
  ScraperInstructionInfo,
  { type: ScraperInstructionType.PageAction }
>["pageUrl"]

type PageActionInstructionProps = {
  pageIndex: number | undefined
  action: PageAction
  pageUrl?: PageUrlType
} & ComponentProps<"div">

export function PageActionInstruction({
  pageIndex,
  action,
  pageUrl,
  ...divProps
}: PageActionInstructionProps) {
  const tabColor = palette[(pageIndex ?? 0) % palette.length]

  return (
    <div
      {...divProps}
      className={cn("relative overflow-hidden", divProps.className)}
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
      <div className="flex flex-row items-center gap-2">
        <DynamicIcon name={iconsMap[action.type]} className="size-4" />
        <span className="font-medium leading-none">
          {pageActionTypeLabels[action.type]}
        </span>
        {!!pageIndex && (
          <Badge variant="outline" className="text-muted-foreground">
            page: {pageIndex}
          </Badge>
        )}
      </div>

      {pageUrl && (
        <LabeledValue label="URL:" className="text-sm">
          {typeof pageUrl === "string" ? (
            <ExternalLink url={pageUrl} />
          ) : (
            <div className="flex flex-row flex-wrap items-center gap-1 contain-inline-size">
              <ExternalLink url={pageUrl.from} />
              <MoveRight className="size-5 inline text-muted-foreground" />
              <ExternalLink url={pageUrl.to} />
            </div>
          )}
        </LabeledValue>
      )}

      <PageActionDetails action={action} />
    </div>
  )
}

const iconsMap: { [key in PageActionType]: IconName } = {
  [PageActionType.Wait]: "clock",
  [PageActionType.Navigate]: "navigation",
  [PageActionType.Click]: "mouse-pointer-click",
  [PageActionType.Type]: "type",
  [PageActionType.ScrollToTop]: "monitor-up",
  [PageActionType.ScrollToBottom]: "monitor-down",
}
