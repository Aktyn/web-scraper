import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { ElementSelectorType, TAG_NAMES, type CreateScraper } from "@web-scraper/common"
import { useFormContext, type Control } from "react-hook-form"
import { mapToSelectOptions } from "../helpers"
import type { ConditionInstructionFieldName } from "./condition-instruction-form"
import type { PageActionFieldName } from "./page-action-form"
import type { ScraperValueFieldName } from "./scraper-value-form"

const selectorTypeLabels: { [key in ElementSelectorType]: string } = {
  [ElementSelectorType.Query]: "CSS Query",
  [ElementSelectorType.FindByTextContent]: "Find by text content",
}
const selectorTypeOptions = mapToSelectOptions(selectorTypeLabels)

const tagNameOptions = TAG_NAMES.map((tag) => ({
  value: tag,
  label: tag.toUpperCase(),
}))

interface ScraperSelectorFormProps {
  control: Control<CreateScraper>
  fieldName:
    | `${ScraperValueFieldName}.selector`
    | `${PageActionFieldName}.selector`
    | `${ConditionInstructionFieldName}.if.selector`
}

export function ScraperSelectorForm({ control, fieldName }: ScraperSelectorFormProps) {
  return (
    <div className="space-y-4">
      <FormSelect
        control={control}
        className="*:[button]:w-full"
        name={`${fieldName}.type`}
        label="Selector Type"
        placeholder="Select selector type"
        options={selectorTypeOptions}
      />

      <SelectorFormByType control={control} fieldName={fieldName} />
    </div>
  )
}

function SelectorFormByType({ control, fieldName }: ScraperSelectorFormProps) {
  const { watch } = useFormContext<CreateScraper>()
  const selectorType = watch(`${fieldName}.type`)

  switch (selectorType) {
    case ElementSelectorType.Query:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.query`}
          label="CSS Query"
          placeholder="div.class-name, #element-id, [data-attribute]"
          description="CSS selector to find the element."
        />
      )

    case ElementSelectorType.FindByTextContent:
      return (
        <div className="space-y-4">
          <FormInput
            control={control}
            name={`${fieldName}.text`}
            label="Text Content"
            placeholder="Button text or /regex/"
            description="Text content to search for. Use /pattern/flags for regex."
          />

          <FormSelect
            control={control}
            className="*:[button]:w-full"
            name={`${fieldName}.tagName`}
            label="Tag Name (optional)"
            placeholder="Select tag name"
            options={tagNameOptions}
            description="Limit search to specific HTML tag."
          />
        </div>
      )
  }
}
