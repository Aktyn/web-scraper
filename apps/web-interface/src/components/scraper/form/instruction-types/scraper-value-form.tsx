import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { ScraperValueType, type CreateScraper } from "@web-scraper/common"
import { useFormContext, type Control } from "react-hook-form"
import { mapToSelectOptions } from "../helpers"
import type { ConditionInstructionFieldName } from "./condition-instruction-form"
import { DataKeyField } from "./data-key-field"
import type { PageActionFieldName } from "./page-action-form"
import { ScraperSelectorForm } from "./scraper-selector-form"

const valueTypeLabels: { [key in ScraperValueType]: string } = {
  [ScraperValueType.Literal]: "Literal value",
  [ScraperValueType.CurrentTimestamp]: "Current timestamp",
  [ScraperValueType.ExternalData]: "External data",
  [ScraperValueType.ElementTextContent]: "Element text content",
  [ScraperValueType.ElementAttribute]: "Element attribute",
}

const valueTypeOptions = mapToSelectOptions(valueTypeLabels)

export type ScraperValueFieldName =
  | `instructions.${number}.value`
  | `${PageActionFieldName}.value`
  | `${ConditionInstructionFieldName}.if.valueSelector`

interface ScraperValueFormProps {
  control: Control<CreateScraper>
  fieldName: ScraperValueFieldName
}

export function ScraperValueForm({
  control,
  fieldName,
}: ScraperValueFormProps) {
  return (
    <div className="space-y-4">
      <FormSelect
        control={control}
        className="*:[button]:w-full"
        name={`${fieldName}.type`}
        label="Value Type"
        placeholder="Select value type"
        options={valueTypeOptions}
      />

      <ValueFormByType control={control} fieldName={fieldName} />
    </div>
  )
}

function ValueFormByType({ control, fieldName }: ScraperValueFormProps) {
  const { watch } = useFormContext<CreateScraper>()
  const valueType = watch(`${fieldName}.type`)

  switch (valueType) {
    case ScraperValueType.CurrentTimestamp:
      return null

    case ScraperValueType.Literal:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.value`}
          label="Literal Value"
          placeholder="Enter literal value"
          description="A static text value. It can be a string, number, boolean, or empty for null."
        />
      )

    case ScraperValueType.ExternalData:
      return (
        <div className="space-y-4">
          <DataKeyField control={control} name={`${fieldName}.dataKey`} />
          <FormInput
            control={control}
            name={`${fieldName}.defaultValue`}
            label="Default Value (optional)"
            placeholder="Default value if data not found"
            description="Value to use if external data is not available."
          />
        </div>
      )

    case ScraperValueType.ElementTextContent:
      return (
        <div>
          <h6 className="font-medium mb-2">Element Selector</h6>
          <ScraperSelectorForm
            control={control}
            fieldName={`${fieldName}.selector`}
          />
        </div>
      )

    case ScraperValueType.ElementAttribute:
      return (
        <div className="space-y-4">
          <div>
            <h6 className="font-medium mb-2">Element Selector</h6>
            <ScraperSelectorForm
              control={control}
              fieldName={`${fieldName}.selector`}
            />
          </div>
          <FormInput
            control={control}
            name={`${fieldName}.attributeName`}
            label="Attribute Name"
            placeholder="href, src, class, etc."
            description="The name of the HTML attribute to extract."
          />
        </div>
      )
  }
}
