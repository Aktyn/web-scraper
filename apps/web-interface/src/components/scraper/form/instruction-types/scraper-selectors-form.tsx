import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { selectorTypeLabels } from "@/lib/dictionaries"
import {
  ElementSelectorType,
  TAG_NAMES,
  type CreateScraper,
} from "@web-scraper/common"
import { ArrowDownFromLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react"
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
} from "react-hook-form"
import { Fragment, useState } from "react"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { SelectorsSeparator } from "../../common/selectors-separator"
import { mapToSelectOptions } from "../helpers"
import type { ConditionInstructionFieldName } from "./condition-instruction-form"
import type { PageActionFieldName } from "./page-action-form"
import type { ScraperValueFieldName } from "./scraper-value-form"
import { FormRegex } from "@/components/common/form/form-regex"

const selectorTypeOptions = mapToSelectOptions(selectorTypeLabels)

const tagNameOptions = TAG_NAMES.map((tag) => ({
  value: tag,
  label: tag.toUpperCase(),
}))

type ScraperSelectorFormProps = {
  control: Control<CreateScraper>
  fieldName:
    | `${ScraperValueFieldName}.selectors`
    | `${PageActionFieldName}.selectors`
    | `${ConditionInstructionFieldName}.if.selectors`
}

export function ScraperSelectorsForm({
  control,
  fieldName,
}: ScraperSelectorFormProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: fieldName,
  })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <Fragment key={field.id}>
          {index > 0 && <SelectorsSeparator />}
          <div className="space-y-2 rounded-lg border bg-background-darker p-3">
            <div className="flex items-center justify-between">
              <h6 className="font-medium">Selector {index + 1}</h6>
              <div className="flex items-center gap-1">
                {fields.length > 1 && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, index - 1)}
                          disabled={index === 0}
                          className="text-muted-foreground"
                          aria-label="Move up"
                        >
                          <ArrowUpFromLine />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move up</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, index + 1)}
                          disabled={index === fields.length - 1}
                          className="text-muted-foreground"
                          aria-label="Move down"
                        >
                          <ArrowDownFromLine />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move down</TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <FormSelect
              control={control}
              className="*:[button]:w-full"
              name={`${fieldName}.${index}.type`}
              label="Selector Type"
              placeholder="Select selector type"
              options={selectorTypeOptions}
            />

            <SelectorFormByType
              control={control}
              fieldName={`${fieldName}.${index}`}
            />
          </div>
        </Fragment>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={() => append({ type: ElementSelectorType.Query, query: "" })}
      >
        <Plus className="size-4" />
        Add Selector
      </Button>
    </div>
  )
}

type SelectorFormByTypeProps = Pick<ScraperSelectorFormProps, "control"> & {
  fieldName: `${ScraperSelectorFormProps["fieldName"]}.${number}`
}

function SelectorFormByType({ control, fieldName }: SelectorFormByTypeProps) {
  const selectorType = useWatch({ control, name: `${fieldName}.type` })

  switch (selectorType) {
    case ElementSelectorType.Query:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.query`}
          label={selectorTypeLabels[selectorType]}
          placeholder="div.class-name, #element-id, [data-attribute]"
          description="CSS selector to find the element."
        />
      )

    case ElementSelectorType.TextContent:
      return (
        <FormRegex
          control={control}
          name={`${fieldName}.text`}
          label={selectorTypeLabels[selectorType]}
          placeholder="Button text or /regex/"
          description="Text content to search for. Use /pattern/flags for regex."
        />
      )
    case ElementSelectorType.TagName:
      return (
        <FormSelect
          control={control}
          className="*:[button]:w-full"
          name={`${fieldName}.tagName`}
          label={selectorTypeLabels[selectorType]}
          placeholder="Select tag name"
          options={tagNameOptions}
        />
      )
    case ElementSelectorType.Attributes:
      return <AttributesForm control={control} fieldName={fieldName} />
  }
}

type AttributesFormProps = {
  control: Control<CreateScraper>
  fieldName: `${ScraperSelectorFormProps["fieldName"]}.${number}`
}

function AttributesForm({ control, fieldName }: AttributesFormProps) {
  const { setValue } = useFormContext<CreateScraper>()
  const attributesFieldName = `${fieldName}.attributes` as const
  const attributes = useWatch({ control, name: attributesFieldName }) ?? {}

  const [newAttributeKey, setNewAttributeKey] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")

  const handleAddAttribute = () => {
    if (newAttributeKey.trim() === "") return
    setValue(
      attributesFieldName,
      {
        ...attributes,
        [newAttributeKey]: newAttributeValue,
      },
      { shouldValidate: true },
    )
    setNewAttributeKey("")
    setNewAttributeValue("")
  }

  const handleRemoveAttribute = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = attributes
    setValue(attributesFieldName, rest, { shouldValidate: true })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3">
        {Object.keys(attributes).length > 0 ? (
          Object.entries(attributes).map(([key]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1">
                <FormInput
                  control={control}
                  name={`${attributesFieldName}.${key}`}
                  label={
                    <>
                      <span>{key}</span>
                      <span className="text-muted-foreground">=</span>
                    </>
                  }
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttribute(key)}
                    className="text-destructive hover:text-destructive self-end"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No attributes defined.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2 pt-2">
        <div className="flex-1 flex flex-col gap-1">
          <Label>Attribute name</Label>
          <Input
            value={newAttributeKey}
            onChange={(e) => setNewAttributeKey(e.target.value)}
            placeholder="e.g. data-testid"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <Label>Attribute value</Label>
          <Input
            value={newAttributeValue}
            onChange={(e) => setNewAttributeValue(e.target.value)}
            placeholder="Value or /regex/"
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleAddAttribute}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  )
}
