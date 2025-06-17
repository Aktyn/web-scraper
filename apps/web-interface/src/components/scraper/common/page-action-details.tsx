import { CopyButton } from "@/components/common/button/copy-button"
import { ExternalLink } from "@/components/common/button/external-link"
import { LabeledValue } from "@/components/common/label/labeled-value"
import { formatDuration } from "@/lib/utils"
import type { PageAction } from "@web-scraper/common"
import { PageActionType } from "@web-scraper/common"
import { Check, MousePointerClick } from "lucide-react"
import { ScraperSelector } from "../instruction-types/scraper-selector"
import { ScraperValue } from "../instruction-types/scraper-value"
import { Label } from "@/components/shadcn/label"

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
        <LabeledValue label="URL">
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
          {action.waitForNavigation && (
            <LabeledValue label="Wait for navigation:">
              <Check className="size-4 text-success" />
            </LabeledValue>
          )}
          {action.useGhostCursor && (
            <Label className="flex flex-row items-center gap-2">
              <MousePointerClick className="size-4 inline" />
              <span>Ghost cursor</span>
            </Label>
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
          {action.clearBeforeType && (
            <LabeledValue
              label="Clear before typing:"
              className="w-full flex-row items-center gap-x-2"
            >
              <Check className="size-4 text-success" />
            </LabeledValue>
          )}
          {action.pressEnter && (
            <LabeledValue label="Press enter:">
              <Check className="size-4 text-success" />
            </LabeledValue>
          )}
          {action.waitForNavigation && (
            <LabeledValue label="Wait for navigation:">
              <Check className="size-4 text-success" />
            </LabeledValue>
          )}
        </div>
      )

    case PageActionType.ScrollToTop:
    case PageActionType.ScrollToBottom:
      return null
  }
}
