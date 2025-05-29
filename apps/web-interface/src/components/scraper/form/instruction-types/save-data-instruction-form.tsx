import type { CreateScraper } from "@web-scraper/common"
import type { Control } from "react-hook-form"
import { DataKeyField } from "./data-key-field"
import { ScraperValueForm } from "./scraper-value-form"

interface SaveDataInstructionFormProps {
  control: Control<CreateScraper>
  fieldName: `instructions.${number}`
}

export function SaveDataInstructionForm({ control, fieldName }: SaveDataInstructionFormProps) {
  return (
    <div className="space-y-4">
      <DataKeyField control={control} name={`${fieldName}.dataKey`} />

      <div>
        <h5 className="font-medium mb-2">Value to Save</h5>
        <ScraperValueForm control={control} fieldName={`${fieldName}.value`} />
      </div>
    </div>
  )
}
