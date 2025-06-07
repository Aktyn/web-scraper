import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import type { ScraperCondition, ScraperInstructions } from "@web-scraper/common"
import { ScraperConditionType } from "@web-scraper/common"
import { Split } from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import type { ComponentProps, ReactNode } from "react"
import { ScraperInstructionsTree } from "../scraper-instructions-tree"
import { ScraperSelector } from "./scraper-selector"
import { ScraperValue } from "./scraper-value"
import { LabeledValue } from "@/components/common/labeled-value"

type ConditionInstructionProps = {
  condition: ScraperCondition
  thenInstructions: ScraperInstructions
  elseInstructions?: ScraperInstructions
  additionalHeaderContent?: ReactNode
} & ComponentProps<"div">

export function ConditionInstruction({
  condition,
  thenInstructions,
  elseInstructions,
  additionalHeaderContent,
  ...divProps
}: ConditionInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Split className="size-4" />
        <span className="font-medium leading-none">Condition</span>
        {additionalHeaderContent}
      </div>

      <div className="space-y-1 mt-2">
        <div className="flex items-center gap-2">
          <DynamicIcon name={iconsMap[condition.type]} className="size-4" />
          <span className="text-sm font-medium capitalize leading-none">
            {condition.type}
          </span>
        </div>
        <ConditionDetails condition={condition} />
      </div>

      {thenInstructions && thenInstructions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="then">
            <AccordionTrigger tabIndex={-1}>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                THEN ({pluralize(thenInstructions.length, "instruction")})
              </div>
            </AccordionTrigger>
            <AccordionContent
              data-then-instructions
              className="pb-0 bg-primary/5 rounded-lg"
            >
              <ScraperInstructionsTree instructions={thenInstructions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {elseInstructions && elseInstructions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="else">
            <AccordionTrigger tabIndex={-1}>
              <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                ELSE ({pluralize(elseInstructions.length, "instruction")})
              </div>
            </AccordionTrigger>
            <AccordionContent
              data-else-instructions
              className="pb-0 bg-secondary/5 rounded-lg"
            >
              <ScraperInstructionsTree instructions={elseInstructions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

const iconsMap: { [key in ScraperConditionType]: IconName } = {
  [ScraperConditionType.IsVisible]: "eye",
  [ScraperConditionType.TextEquals]: "square-equal",
}

function ConditionDetails({ condition }: { condition: ScraperCondition }) {
  switch (condition.type) {
    case ScraperConditionType.IsVisible:
      return (
        <LabeledValue label="Check if element is visible:">
          <ScraperSelector selectors={condition.selectors} />
        </LabeledValue>
      )

    case ScraperConditionType.TextEquals: {
      const textValue =
        typeof condition.text === "string"
          ? condition.text
          : `/${condition.text.source}/${condition.text.flags}`

      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Value to check:
            </span>
            <ScraperValue value={condition.valueSelector} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Expected text:
            </span>
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
              {textValue}
            </span>
          </div>
        </div>
      )
    }
  }
}
