import { FormSelect } from "@/components/common/form/form-select"
import { FormInput } from "@/components/common/form/form-input"
import { ScraperConditionType, type CreateScraper } from "@web-scraper/common"
import { type Control, useFormContext } from "react-hook-form"
import { ScraperSelectorForm } from "./scraper-selector-form"
import { ScraperValueForm } from "./scraper-value-form"
import { ScraperInstructionsForm } from "../scraper-instructions-form"
import { mapToSelectOptions } from "../helpers"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"

const conditionTypeLabels: { [key in ScraperConditionType]: string } = {
  [ScraperConditionType.IsVisible]: "Element is visible",
  [ScraperConditionType.TextEquals]: "Text equals",
}

const conditionTypeOptions = mapToSelectOptions(conditionTypeLabels)

export type ConditionInstructionFieldName = `instructions.${number}`

interface ConditionInstructionFormProps {
  control: Control<CreateScraper>
  fieldName: ConditionInstructionFieldName
}

export function ConditionInstructionForm({
  control,
  fieldName,
}: ConditionInstructionFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium">Condition</h5>

        <FormSelect
          control={control}
          className="*:[button]:w-full"
          name={`${fieldName}.if.type`}
          label="Condition Type"
          placeholder="Select condition type"
          options={conditionTypeOptions}
        />

        <ConditionFormByType control={control} fieldName={fieldName} />
      </div>

      <Accordion type="multiple" defaultValue={["then", "else"]}>
        <AccordionItem value="then">
          <AccordionTrigger>
            <h5 className="font-medium text-primary">Then instructions</h5>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instructions to execute when the condition is true.
              </p>
              <div className="border-l-2 border-primary/70 pl-4">
                <ScraperInstructionsForm
                  control={control}
                  name={`${fieldName}.then`}
                  condition="then"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="else">
          <AccordionTrigger>
            <h5 className="font-medium text-secondary">Else instructions</h5>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instructions to execute when the condition is false.
              </p>
              <div className="border-l-2 border-secondary/70 pl-4">
                <ScraperInstructionsForm
                  control={control}
                  name={`${fieldName}.else`}
                  condition="else"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function ConditionFormByType({
  control,
  fieldName,
}: ConditionInstructionFormProps) {
  const { watch } = useFormContext<CreateScraper>()
  const conditionType = watch(`${fieldName}.if.type`)

  switch (conditionType) {
    case ScraperConditionType.IsVisible:
      return (
        <div>
          <h6 className="font-medium mb-2">Element Selector</h6>
          <ScraperSelectorForm
            control={control}
            fieldName={`${fieldName}.if.selector`}
          />
        </div>
      )

    case ScraperConditionType.TextEquals:
      return (
        <div className="space-y-4">
          <div>
            <h6 className="font-medium mb-2">Value Selector</h6>
            <ScraperValueForm
              control={control}
              fieldName={`${fieldName}.if.valueSelector`}
            />
          </div>

          <FormInput
            control={control}
            name={`${fieldName}.if.text`}
            label="Expected Text"
            placeholder="Expected text value or /regex/"
            description="Text to compare against. Use /pattern/flags for regex."
          />
        </div>
      )
  }
}
