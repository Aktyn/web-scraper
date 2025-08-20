import { FormInput } from "@/components/common/form/form-input"
import { FormRegex } from "@/components/common/form/form-regex"
import { FormSelect } from "@/components/common/form/form-select"
import { Badge } from "@/components/shadcn/badge"
import { Button } from "@/components/shadcn/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import {
  instructionTypeLabels,
  pageActionTypeLabels,
  systemActionTypeLabels,
} from "@/lib/dictionaries"
import { palette } from "@/lib/palette"
import { cn } from "@/lib/utils"
import {
  PageActionType,
  ScraperConditionType,
  ScraperInstructionType,
  type ScraperInstructions,
  type UpsertScraper,
} from "@web-scraper/common"
import {
  FoldVertical,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
  UnfoldVertical,
} from "lucide-react"
import { useState } from "react"
import { useFieldArray, useWatch, type Control } from "react-hook-form"
import { PageIndexField } from "./common/page-index-field"
import { mapToSelectOptions } from "./helpers"
import { ConditionInstructionForm } from "./instruction-types/condition-instruction-form"
import { DeleteDataInstructionForm } from "./instruction-types/delete-data-instruction-form"
import { LogDataInstructionForm } from "./instruction-types/log-data-instruction-form"
import { PageActionForm } from "./instruction-types/page-action-form"
import {
  SaveDataBatchInstructionForm,
  SaveDataInstructionForm,
} from "./instruction-types/save-data-instruction-form"
import { SystemActionInstructionForm } from "./instruction-types/system-action-instruction-form"

const instructionTypeOptions = mapToSelectOptions(instructionTypeLabels)

const defaultInstruction = {
  type: ScraperInstructionType.PageAction,
  action: {
    type: PageActionType.Navigate,
    url: "",
  },
} as const satisfies ScraperInstructions[number]

interface ScraperInstructionsFormProps {
  control: Control<UpsertScraper>
  name?: string
  condition?: "then" | "else"
}

export function ScraperInstructionsForm({
  control,
  name = "instructions",
  condition,
}: ScraperInstructionsFormProps) {
  const { fields, append, remove, move } = useFieldArray<UpsertScraper, never>({
    control,
    name,
  })

  const addInstruction = () => {
    append({ ...defaultInstruction })
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      {fields.map((field, index) => {
        const fieldName = `${name}.${index}` as `instructions.${number}`

        return (
          <InstructionField
            key={field.id}
            control={control}
            fieldName={fieldName}
            index={index}
            fieldsCount={fields.length}
            move={move}
            remove={remove}
          />
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

type InstructionFieldProps = {
  control: Control<UpsertScraper>
  fieldName: `instructions.${number}`
  index: number
  fieldsCount: number
  move: (index: number, newIndex: number) => void
  remove: (index: number) => void
}

function InstructionField({
  control,
  fieldName,
  index,
  fieldsCount,
  move,
  remove,
}: InstructionFieldProps) {
  const instruction = useWatch({ control, name: fieldName })

  const [collapsed, setCollapsed] = useState(
    !(
      instruction.type === defaultInstruction.type &&
      instruction.action.type === defaultInstruction.action.type &&
      instruction.action.url === ""
    ),
  )

  const tabColor =
    instruction?.type === ScraperInstructionType.PageAction
      ? palette[(instruction.pageIndex ?? 0) % palette.length]
      : instruction?.type === ScraperInstructionType.Condition &&
          instruction.if?.type === ScraperConditionType.IsElementVisible
        ? palette[(instruction.if.pageIndex ?? 0) % palette.length]
        : palette[0]

  return (
    <div
      className="border rounded-lg p-4 flex flex-col items-stretch gap-4 transition-colors"
      style={
        tabColor
          ? {
              borderColor:
                tabColor !== palette[0] ? `${tabColor}50` : undefined,
              backgroundColor: `${tabColor}04`,
            }
          : undefined
      }
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-md transition-[background-color,padding,margin]",
          collapsed && "cursor-pointer hover:bg-primary/10 p-2 -m-2",
        )}
        onClick={() => collapsed && setCollapsed(false)}
      >
        <h4 className="font-medium flex flex-row items-center gap-2">
          {/* TODO: allow custom instruction name for improved UX */}
          <span>
            Instruction <b>{index + 1}</b>
          </span>
          <Badge
            variant="outline"
            className={cn(
              "starting:opacity-0 transition-opacity text-muted-foreground border-none",
              !collapsed ? "opacity-0" : "opacity-100",
            )}
          >
            {instructionTypeLabels[instruction.type]}
            {instruction.type === ScraperInstructionType.PageAction && (
              <>
                {!!instruction.pageIndex && (
                  <span> (page: {instruction.pageIndex + 1})</span>
                )}
                <span> -&gt; </span>
                {instruction.action.type ? (
                  <span>{pageActionTypeLabels[instruction.action.type]}</span>
                ) : (
                  <span className="text-warning">Unknown action type</span>
                )}
              </>
            )}
          </Badge>
        </h4>
        <div className="flex items-center gap-1">
          {fieldsCount > 1 && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      move(index, index - 1)
                    }}
                    disabled={index === 0}
                    className="text-muted-foreground"
                    aria-label="Move up"
                  >
                    <MoveUp />
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
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      move(index, index + 1)
                    }}
                    disabled={index === fieldsCount - 1}
                    className="text-muted-foreground"
                    aria-label="Move down"
                  >
                    <MoveDown />
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
                aria-label="Toggle collapsed state"
                onClick={(event) => {
                  event.preventDefault()
                  setCollapsed(!collapsed)
                }}
              >
                {collapsed ? <UnfoldVertical /> : <FoldVertical />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.preventDefault()
                  remove(index)
                }}
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

      <div
        className={cn(
          "grid transition-[grid-template-rows]",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="flex flex-col items-stretch gap-4 overflow-hidden">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <FormSelect
              control={control}
              className="*:[button]:w-full flex-1"
              name={`${fieldName}.type`}
              label="Instruction type"
              placeholder="Select instruction type"
              options={instructionTypeOptions}
            />
            {instruction.type === ScraperInstructionType.PageAction && (
              <PageIndexField
                control={control}
                fieldName={`${fieldName}.pageIndex`}
              />
            )}
          </div>

          <InstructionForm control={control} fieldName={fieldName} />
        </div>
      </div>
    </div>
  )
}

const pageActionTypeOptions = mapToSelectOptions(pageActionTypeLabels)
const systemActionTypeOptions = mapToSelectOptions(systemActionTypeLabels)

type InstructionFormProps = {
  control: Control<UpsertScraper>
  fieldName: `instructions.${number}`
}

function InstructionForm({ control, fieldName }: InstructionFormProps) {
  const instructionType = useWatch({ control, name: fieldName })?.type

  switch (instructionType) {
    case ScraperInstructionType.PageAction:
      return (
        <div className="space-y-4">
          <FormSelect
            control={control}
            className="*:[button]:w-full"
            name={`${fieldName}.action.type`}
            label="Action type"
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

    case ScraperInstructionType.DeleteCookies:
      return (
        <FormRegex
          control={control}
          name={`${fieldName}.domain`}
          label="Domain"
          placeholder="example.com or /regex/"
          description="The domain to delete cookies from. Can be a string or a regular expression."
        />
      )

    case ScraperInstructionType.LogData:
      return <LogDataInstructionForm control={control} fieldName={fieldName} />
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
          label="Marker name"
          placeholder="marker_name"
          description="A unique name for this marker."
        />
      )

    case ScraperInstructionType.Jump:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.markerName`}
          label="Target marker"
          placeholder="marker_name"
          description="The name of the marker to jump to."
        />
      )

    case ScraperInstructionType.SystemAction:
      return (
        <div className="space-y-4">
          <FormSelect
            control={control}
            className="*:[button]:w-full"
            name={`${fieldName}.systemAction.type`}
            label="System action type"
            placeholder="Select system action type"
            options={systemActionTypeOptions}
          />
          <SystemActionInstructionForm
            control={control}
            fieldName={`${fieldName}.systemAction`}
          />
        </div>
      )
  }
}
