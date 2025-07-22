import { FormSelect } from "@/components/common/form/form-select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { conditionTypeLabels } from "@/lib/dictionaries"
import { ScraperConditionType, type UpsertScraper } from "@web-scraper/common"
import { useWatch, type Control } from "react-hook-form"
import { PageIndexField } from "../common/page-index-field"
import { mapToSelectOptions } from "../helpers"
import { ScraperInstructionsForm } from "../scraper-instructions-form"
import { ScraperSelectorsForm } from "./scraper-selectors-form"
import { ScraperValueForm } from "./scraper-value-form"

const conditionTypeOptions = mapToSelectOptions(conditionTypeLabels)

export type ConditionInstructionFieldName = `instructions.${number}`

interface ConditionInstructionFormProps {
  control: Control<UpsertScraper>
  fieldName: ConditionInstructionFieldName
}

export function ConditionInstructionForm({
  control,
  fieldName,
}: ConditionInstructionFormProps) {
  const conditionType = useWatch({ control, name: `${fieldName}.if.type` })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-row flex-wrap items-center gap-2">
          <FormSelect
            control={control}
            className="*:[button]:w-full flex-1"
            name={`${fieldName}.if.type`}
            label="Condition type"
            placeholder="Select condition type"
            options={conditionTypeOptions}
          />
          {conditionType === ScraperConditionType.IsElementVisible && (
            <PageIndexField
              control={control}
              fieldName={`${fieldName}.if.pageIndex`}
            />
          )}
        </div>

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
  const conditionType = useWatch({ control, name: `${fieldName}.if.type` })

  switch (conditionType) {
    case ScraperConditionType.IsElementVisible:
      return (
        <div>
          <h6 className="font-medium mb-2">Element Selector</h6>
          <ScraperSelectorsForm
            control={control}
            fieldName={`${fieldName}.if.selectors`}
          />
        </div>
      )

    case ScraperConditionType.AreValuesEqual:
      return (
        <div className="space-y-4">
          <div>
            <h6 className="font-medium mb-2">First value selector</h6>
            <ScraperValueForm
              control={control}
              fieldName={`${fieldName}.if.firstValueSelector`}
            />
          </div>
          <div>
            <h6 className="font-medium mb-2">Second value selector</h6>
            <ScraperValueForm
              control={control}
              fieldName={`${fieldName}.if.secondValueSelector`}
            />
          </div>
        </div>
      )
  }
}
