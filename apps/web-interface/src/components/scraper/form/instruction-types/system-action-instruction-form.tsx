import { FormInput } from "@/components/common/form/form-input"
import { SystemActionType, type CreateScraper } from "@web-scraper/common"
import { useWatch, type Control } from "react-hook-form"

interface SystemActionInstructionFormProps {
  control: Control<CreateScraper>
  fieldName: `instructions.${number}.systemAction`
}

export function SystemActionInstructionForm({
  control,
  fieldName,
}: SystemActionInstructionFormProps) {
  const systemActionType = useWatch({ control, name: `${fieldName}.type` })

  switch (systemActionType) {
    case SystemActionType.ShowNotification:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.message`}
          label="Message"
          placeholder="Hello, world!"
          description="The message to display in the notification."
        />
      )
    default:
      return <div>Unknown system action type</div>
  }
}
