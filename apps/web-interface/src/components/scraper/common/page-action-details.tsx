import { CopyButton } from "@/components/common/button/copy-button"
import { ExternalLink } from "@/components/common/button/external-link"
import { LabeledValue } from "@/components/common/label/labeled-value"
import { Label } from "@/components/shadcn/label"
import { formatDuration } from "@/lib/utils"
import type { PageAction } from "@web-scraper/common"
import { PageActionType } from "@web-scraper/common"
import {
  CornerDownLeft,
  Delete,
  Hourglass,
  MousePointerClick,
} from "lucide-react"
import { ScraperSelector } from "../instruction-types/scraper-selector"
import { ScraperValue } from "../instruction-types/scraper-value"

export function PageActionDetails({ action }: { action: PageAction }) {
  switch (action.type) {
    case PageActionType.Wait:
      return (
        <LabeledValue label="Duration">
          {formatDuration(action.duration)}
        </LabeledValue>
      )

    case PageActionType.Navigate:
      return (
        <LabeledValue label="To:">
          <div className="flex flex-row items-center gap-2">
            <ExternalLink url={action.url} />
            <CopyButton value={action.url} className="size-6" />
          </div>
        </LabeledValue>
      )

    case PageActionType.Click:
      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <LabeledValue label="Target:">
            <ScraperSelector selectors={action.selectors} />
          </LabeledValue>
          {(action.waitForNavigation || action.useGhostCursor) && (
            <div className="flex flex-col gap-2">
              {action.waitForNavigation && (
                <Label className="flex flex-row items-center gap-2">
                  <Hourglass className="size-4 inline" />
                  <span>Wait for navigation</span>
                </Label>
              )}
              {action.useGhostCursor && (
                <Label className="flex flex-row items-center gap-2 pointer-events-auto">
                  <MousePointerClick className="size-4 inline" />
                  <span>Ghost cursor</span>
                </Label>
              )}
            </div>
          )}
        </div>
      )

    case PageActionType.Type:
      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <LabeledValue label="Target:">
            <ScraperSelector selectors={action.selectors} />
          </LabeledValue>
          <LabeledValue label="Value:">
            <ScraperValue value={action.value} />
          </LabeledValue>
          {(action.clearBeforeType ||
            action.pressEnter ||
            action.waitForNavigation) && (
            <div className="flex flex-col gap-2">
              {action.clearBeforeType && (
                <Label className="flex flex-row items-center gap-2">
                  <Delete className="size-4 inline" />
                  <span>Clear before typing</span>
                </Label>
              )}
              {action.pressEnter && (
                <Label className="flex flex-row items-center gap-2">
                  <CornerDownLeft className="size-4 inline" />
                  <span>Press enter</span>
                </Label>
              )}
              {action.waitForNavigation && (
                <Label className="flex flex-row items-center gap-2">
                  <Hourglass className="size-4 inline" />
                  <span>Wait for navigation</span>
                </Label>
              )}
            </div>
          )}
        </div>
      )

    case PageActionType.ScrollToTop:
    case PageActionType.ScrollToBottom:
      return null
  }
}
