import { FormInput } from "@/components/common/form/form-input"
import { Button } from "@/components/shadcn/button"
import type { UpsertScraper } from "@web-scraper/common"
import { Minus, Plus } from "lucide-react"
import type { Control } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"
import type { PageActionFieldName } from "../instruction-types/page-action-form.js"
import type { ConditionInstructionFieldName } from "../instruction-types/condition-instruction-form.js"

type PageIndexFieldProps = {
  control: Control<UpsertScraper>
  fieldName:
    | `instructions.${number}.pageIndex`
    | `instructions.${number}.value.pageIndex`
    | `${PageActionFieldName}.value.pageIndex`
    | `${PageActionFieldName}.evaluator.arguments.${number}.pageIndex`
    | `${ConditionInstructionFieldName}.if.pageIndex`
    | `${ConditionInstructionFieldName}.if.valueSelector.pageIndex`
}

export function PageIndexField(props: PageIndexFieldProps) {
  return (
    <FormInput
      control={props.control}
      className="w-26 max-w-full **:[input]:px-9 **:[input]:text-center"
      name={props.fieldName}
      label="Page index"
      placeholder="0"
      inputProps={{ readOnly: true }}
      startAdornment={<PageIndexChangeButton {...props} factor={-1} />}
      endAdornment={<PageIndexChangeButton {...props} factor={1} />}
    />
  )
}

type PageIndexChangeButtonProps = PageIndexFieldProps & {
  factor: number
}

function PageIndexChangeButton({
  control,
  fieldName: name,
  factor,
}: PageIndexChangeButtonProps) {
  const pageIndexValue = useWatch({ control, name })
  const pageIndex = pageIndexValue ?? 0

  const { setValue } = useFormContext()

  return (
    <Button
      variant="ghost"
      size="icon"
      tabIndex={-1}
      disabled={pageIndex + factor < 0 || pageIndex + factor > 255}
      onClick={(event) => {
        event.preventDefault()
        setValue(name, pageIndex + factor)
      }}
    >
      {factor > 0 ? <Plus /> : <Minus />}
    </Button>
  )
}
