import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { Button } from "@/components/shadcn/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import {
  PageActionType,
  ScraperInstructionType,
  type CreateScraper,
  type ScraperInstructions,
} from "@web-scraper/common"
import { ArrowDownFromLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useFormContext, type Control } from "react-hook-form"
import { mapToSelectOptions } from "./helpers"
import { ConditionInstructionForm } from "./instruction-types/condition-instruction-form"
import { DeleteDataInstructionForm } from "./instruction-types/delete-data-instruction-form"
import { PageActionForm } from "./instruction-types/page-action-form"
import {
  SaveDataBatchInstructionForm,
  SaveDataInstructionForm,
} from "./instruction-types/save-data-instruction-form"

const instructionTypeLabels: { [key in ScraperInstructionType]: string } = {
  [ScraperInstructionType.PageAction]: "Page action",
  [ScraperInstructionType.Condition]: "Condition",
  [ScraperInstructionType.SaveData]: "Save data",
  [ScraperInstructionType.SaveDataBatch]: "Save data batch",
  [ScraperInstructionType.DeleteData]: "Delete data",
  [ScraperInstructionType.Marker]: "Marker",
  [ScraperInstructionType.Jump]: "Jump",
}
const instructionTypeOptions = mapToSelectOptions(instructionTypeLabels)

interface ScraperInstructionsFormProps {
  control: Control<CreateScraper>
  name?: string
  condition?: "then" | "else"
}

export function ScraperInstructionsForm({
  control,
  name = "instructions",
  condition,
}: ScraperInstructionsFormProps) {
  const { fields, append, remove, move } = useFieldArray<
    CreateScraper,
    "instructions"
  >({
    control,
    name: name as never,
  })

  const addInstruction = () => {
    const newInstruction: ScraperInstructions[number] = {
      type: ScraperInstructionType.PageAction,
      action: {
        type: PageActionType.Navigate,
        url: "",
      },
    }
    append(newInstruction)
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      {fields.map((field, index) => {
        const fieldName = `${name}.${index}` as `instructions.${number}`

        return (
          <div
            key={field.id}
            className="border rounded-lg p-4 flex flex-col items-stretch gap-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Instruction {index + 1}</h4>
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
              name={`${fieldName}.type`}
              label="Instruction type"
              placeholder="Select instruction type"
              options={instructionTypeOptions}
            />

            <InstructionForm control={control} fieldName={fieldName} />
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        className={cn(
          condition === "then" && "text-primary",
          condition === "else" && "text-secondary",
        )}
        onClick={addInstruction}
      >
        <Plus />
        Add {condition && `${condition} `}instruction
      </Button>
    </div>
  )
}

const pageActionTypeLabels: { [key in PageActionType]: string } = {
  [PageActionType.Navigate]: "Navigate",
  [PageActionType.Wait]: "Wait",
  [PageActionType.Click]: "Click",
  [PageActionType.Type]: "Type",
}

const pageActionTypeOptions = mapToSelectOptions(pageActionTypeLabels)

type InstructionFormProps = {
  control: Control<CreateScraper>
  fieldName: `instructions.${number}`
}

function InstructionForm({ control, fieldName }: InstructionFormProps) {
  const { watch } = useFormContext<CreateScraper>()
  const instructionType = watch(fieldName)?.type

  switch (instructionType) {
    case ScraperInstructionType.PageAction:
      return (
        <div className="space-y-4">
          <FormSelect
            control={control}
            className="*:[button]:w-full"
            name={`${fieldName}.action.type`}
            label="Action Type"
            placeholder="Select action type"
            options={pageActionTypeOptions}
          />
          <PageActionForm control={control} fieldName={`${fieldName}.action`} />
        </div>
      )

    case ScraperInstructionType.Condition:
      return (
        <ConditionInstructionForm control={control} fieldName={fieldName} />
      )

    case ScraperInstructionType.SaveData:
      return <SaveDataInstructionForm control={control} fieldName={fieldName} />
    case ScraperInstructionType.SaveDataBatch:
      return (
        <SaveDataBatchInstructionForm control={control} fieldName={fieldName} />
      )

    case ScraperInstructionType.DeleteData:
      return (
        <DeleteDataInstructionForm control={control} fieldName={fieldName} />
      )

    case ScraperInstructionType.Marker:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.name`}
          label="Marker Name"
          placeholder="marker_name"
          description="A unique name for this marker."
        />
      )

    case ScraperInstructionType.Jump:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.markerName`}
          label="Target Marker"
          placeholder="marker_name"
          description="The name of the marker to jump to."
        />
      )
  }
}
