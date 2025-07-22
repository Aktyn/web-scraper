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
import { ScraperValue } from "../common/scraper-value"
import { LabeledValue } from "@/components/common/label/labeled-value"
import { countInstructions } from "../common/helpers"
import { palette } from "@/lib/palette"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/shadcn/badge"

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
  const pageIndex =
    condition.type === ScraperConditionType.IsElementVisible
      ? condition.pageIndex
      : undefined
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

      <div className="flex items-center gap-2">
        <Split className="size-4" />
        <span className="font-medium leading-none">Condition</span>
        {additionalHeaderContent}
        {!!pageIndex && (
          <Badge variant="outline" className="text-muted-foreground">
            page: {pageIndex + 1}
          </Badge>
        )}
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
                THEN (
                {pluralize(countInstructions(thenInstructions), "instruction")})
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
                ELSE (
                {pluralize(countInstructions(elseInstructions), "instruction")})
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
  [ScraperConditionType.IsElementVisible]: "eye",
  [ScraperConditionType.AreValuesEqual]: "square-equal",
}

function ConditionDetails({ condition }: { condition: ScraperCondition }) {
  switch (condition.type) {
    case ScraperConditionType.IsElementVisible:
      return (
        <LabeledValue label="Check if element is visible:">
          <ScraperSelector selectors={condition.selectors} />
        </LabeledValue>
      )

    case ScraperConditionType.AreValuesEqual: {
      return (
        <div className="flex flex-row flex-wrap gap-3">
          {[condition.firstValueSelector, condition.secondValueSelector].map(
            (selector, index) => (
              <div key={index} className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  {index === 0 ? "First" : "Second"} value:
                </span>
                <ScraperValue value={selector} />
              </div>
            ),
          )}
        </div>
      )
    }
  }
}
