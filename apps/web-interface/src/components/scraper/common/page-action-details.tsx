import { CopyButton } from "@/components/common/button/copy-button"
import { ExternalLink } from "@/components/common/button/external-link"
import { LabeledValue } from "@/components/common/label/labeled-value"
import { Label } from "@/components/shadcn/label"
import { formatDuration } from "@/lib/utils"
import type { PageAction } from "@web-scraper/common"
import { PageActionType } from "@web-scraper/common"
import {
  CornerDownLeft,
  Crosshair,
  Delete,
  Eye,
  Hourglass,
  MousePointerClick,
} from "lucide-react"
import { ScraperSelector } from "../instruction-types/scraper-selector"
import { ScraperValue } from "./scraper-value"
import { Code } from "@/components/common/code"
import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { AvailabilityCheck } from "@/components/common/availability-check"

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
          <div className="flex flex-row items-center gap-2 contain-inline-size">
            <ExternalLink url={action.url} className="truncate" />
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
          <ClickActionFlags action={action} />
        </div>
      )

    case PageActionType.SmartClick:
      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <AvailabilityCheck feature={AvailabilityCheck.Feature.SmartClick} />
          <LabeledValue label="Prompt:">{action.aiPrompt}</LabeledValue>
          <ClickActionFlags action={action} />
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

    case PageActionType.ScrollToElement:
      return (
        <LabeledValue label="Target:">
          <ScraperSelector selectors={action.selectors} />
        </LabeledValue>
      )

    case PageActionType.Evaluate:
      return (
        <div className="flex flex-row flex-wrap items-start gap-2 gap-x-4">
          <LabeledValue label="Code:">
            <Code className="overflow-hidden max-h-32">
              {action.evaluator.code}
            </Code>
            <div className="flex flex-row flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Eye /> Show full code
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-2xl" align="start">
                  <Code>{action.evaluator.code}</Code>
                </PopoverContent>
              </Popover>
              <CopyButton value={action.evaluator.code} />
            </div>
          </LabeledValue>
          {!!action.evaluator.arguments?.length && (
            <LabeledValue label="Arguments:">
              <div className="flex flex-row flex-wrap items-start gap-2 gap-x-4">
                {action.evaluator.arguments?.map((value, index) => (
                  <ScraperValue key={index} value={value} />
                ))}
              </div>
            </LabeledValue>
          )}
        </div>
      )

    case PageActionType.RunAutonomousAgent:
      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <AvailabilityCheck
            feature={AvailabilityCheck.Feature.AutonomousAgent}
          />
          <LabeledValue
            label="Task:"
            className="whitespace-pre-wrap max-h-24 overflow-y-auto"
          >
            {action.task}
          </LabeledValue>
          {action.startUrl && (
            <LabeledValue label="Start URL:">
              <ExternalLink url={action.startUrl} />
            </LabeledValue>
          )}
          <LabeledValue label="Maximum steps:">
            {action.maximumSteps ?? 256}
          </LabeledValue>
          {action.usePreciseLocalization && (
            <Label className="flex flex-row items-center gap-2 pointer-events-auto">
              <Crosshair className="size-4 inline" />
              <span>Precise localization</span>
            </Label>
          )}
          {action.useGhostCursor && (
            <Label className="flex flex-row items-center gap-2 pointer-events-auto">
              <MousePointerClick className="size-4 inline" />
              <span>Ghost cursor</span>
            </Label>
          )}
        </div>
      )
  }
}

type ClickActionFlagsProps = {
  action: Extract<
    PageAction,
    { type: PageActionType.Click | PageActionType.SmartClick }
  >
}

function ClickActionFlags({ action }: ClickActionFlagsProps) {
  return (
    (action.waitForNavigation || action.useGhostCursor) && (
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
    )
  )
}
