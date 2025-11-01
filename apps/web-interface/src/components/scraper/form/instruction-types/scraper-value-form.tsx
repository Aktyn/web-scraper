import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { ScraperValueType, type UpsertScraper } from "@web-scraper/common"
import { useWatch, type Control } from "react-hook-form"
import { mapToSelectOptions } from "../helpers"
import type { ConditionInstructionFieldName } from "./condition-instruction-form"
import { DataKeyField } from "./data-key-field"
import type { PageActionFieldName } from "./page-action-form"
import { ScraperSelectorsForm } from "./scraper-selectors-form"
import { scraperValueTypeLabels } from "@/lib/dictionaries"
import { PageIndexField } from "../common/page-index-field"
import { cn } from "@/lib/utils"
import { palette } from "@/lib/palette"
import { FormRegex } from "@/components/common/form/form-regex"

const valueTypeOptions = mapToSelectOptions(scraperValueTypeLabels)

export type ScraperValueFieldName =
  | `instructions.${number}.value`
  | `${PageActionFieldName}.value`
  | `${PageActionFieldName}.evaluator.arguments.${number}`
  | `${ConditionInstructionFieldName}.if.firstValueSelector`
  | `${ConditionInstructionFieldName}.if.secondValueSelector`

interface ScraperValueFormProps {
  control: Control<UpsertScraper>
  fieldName: ScraperValueFieldName
}

export function ScraperValueForm({
  control,
  fieldName,
}: ScraperValueFormProps) {
  const valueSelector = useWatch({ control, name: fieldName })

  const canChoosePageIndex =
    valueSelector?.type === ScraperValueType.ElementTextContent ||
    valueSelector?.type === ScraperValueType.ElementAttribute

  const tabColor = canChoosePageIndex
    ? palette[(valueSelector.pageIndex ?? 0) % palette.length]
    : palette[0]

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-4 p-0 transition-[border-color,background-color,padding]",
        tabColor !== palette[0] && "p-2 border rounded-md",
      )}
      style={
        tabColor
          ? {
              borderColor: `${tabColor}50`,
              backgroundColor: `${tabColor}04`,
            }
          : undefined
      }
    >
      <div
        className={cn(
          "flex flex-row flex-wrap items-center",
          canChoosePageIndex && "gap-2",
        )}
      >
        <FormSelect
          control={control}
          className="*:[button]:w-full flex-1"
          name={`${fieldName}.type`}
          label="Value type"
          placeholder="Select value type"
          options={valueTypeOptions}
        />
        {canChoosePageIndex ? (
          <PageIndexField
            control={control}
            fieldName={`${fieldName}.pageIndex`}
          />
        ) : null}
      </div>

      <ValueFormByType control={control} fieldName={fieldName} />
    </div>
  )
}

function ValueFormByType({ control, fieldName }: ScraperValueFormProps) {
  const valueType = useWatch({ control, name: `${fieldName}.type` })

  switch (valueType) {
    case undefined:
    case ScraperValueType.Null:
    case ScraperValueType.CurrentTimestamp:
      return null

    case ScraperValueType.Literal:
      return (
        <FormRegex
          control={control}
          //@ts-expect-error TODO: adjust to recent package version
          name={`${fieldName}.value`}
          label="Literal value"
          placeholder="Enter literal value"
          description="A static text value. It can be a string, number, boolean, or empty for null. Use /pattern/flags for regex."
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
          <h6 className="font-medium mb-2">Element selector</h6>
          <ScraperSelectorsForm
            control={control}
            fieldName={`${fieldName}.selectors`}
          />
        </div>
      )

    case ScraperValueType.ElementAttribute:
      return (
        <div className="space-y-4">
          <div>
            <h6 className="font-medium mb-2">Element selector</h6>
            <ScraperSelectorsForm
              control={control}
              fieldName={`${fieldName}.selectors`}
            />
          </div>
          <FormInput
            control={control}
            name={`${fieldName}.attributeName`}
            label="Attribute name"
            placeholder="href, src, class, etc."
            description="The name of the HTML attribute to extract."
          />
        </div>
      )
  }
}
