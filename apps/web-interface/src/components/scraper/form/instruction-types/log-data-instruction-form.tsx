import type { UpsertScraper } from "@web-scraper/common"
import type { Control } from "react-hook-form"
import { ScraperValueForm } from "./scraper-value-form"

interface SaveDataInstructionFormProps {
  control: Control<UpsertScraper>
  fieldName: `instructions.${number}`
}

export function LogDataInstructionForm({
  control,
  fieldName,
}: SaveDataInstructionFormProps) {
  return (
    <div>
      <h5 className="font-medium mb-2">Value to log</h5>
      <ScraperValueForm control={control} fieldName={`${fieldName}.value`} />
    </div>
  )
}
