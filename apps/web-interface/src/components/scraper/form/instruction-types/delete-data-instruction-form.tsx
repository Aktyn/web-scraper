import type { CreateScraper } from "@web-scraper/common"
import type { Control } from "react-hook-form"
import { DataKeyField } from "./data-key-field"

interface DeleteDataInstructionFormProps {
  control: Control<CreateScraper>
  fieldName: `instructions.${number}`
}

export function DeleteDataInstructionForm({ control, fieldName }: DeleteDataInstructionFormProps) {
  return <DataKeyField control={control} name={`${fieldName}.dataKey`} />
}
