import { FormTextarea } from "@/components/common/form/form-textarea"
import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { ScraperValueType, type CreateScraper } from "@web-scraper/common"
import { Eye, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useWatch, type Control } from "react-hook-form"
import type { PageActionFieldName } from "../instruction-types/page-action-form"
import { ScraperValueForm } from "../instruction-types/scraper-value-form"
import { Code } from "@/components/common/code"

type EvaluatorFieldProps = {
  control: Control<CreateScraper>
  fieldName: `${PageActionFieldName}.evaluator`
}

export function EvaluatorField({ control, fieldName }: EvaluatorFieldProps) {
  const code = useWatch({ control, name: `${fieldName}.code` })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { fields, append, remove } = useFieldArray<CreateScraper, never>({
    control,
    name: `${fieldName}.arguments` as never,
  })

  return (
    <div className="space-y-4">
      <FormTextarea
        control={control}
        name={`${fieldName}.code`}
        className="*:[textarea]:min-h-32 *:[textarea]:font-mono *:[textarea]:text-sm"
        label={
          <div className="flex flex-row items-center gap-2">
            <span>Code</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-auto p-2 -my-1"
                  tabIndex={-1}
                >
                  <Eye />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-2xl" align="start">
                <Code>{code ?? ""}</Code>
              </PopoverContent>
            </Popover>
          </div>
        }
        placeholder="JavaScript code to evaluate"
        textareaProps={{
          rows: 8,
        }}
      />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Arguments</h3>
        {fields.length > 0 ? (
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-2 rounded-lg border bg-background-darker p-3"
              >
                <div className="flex items-center justify-between">
                  <h6 className="font-medium">Argument {index + 1}</h6>
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
                </div>
                <ScraperValueForm
                  control={control}
                  fieldName={`${fieldName}.arguments.${index}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No arguments defined.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => append({ type: ScraperValueType.Literal, value: "" })}
        >
          <Plus className="size-4" />
          Add Argument
        </Button>
      </div>
    </div>
  )
}
