import { FormInput } from "@/components/common/form/form-input"
import type { CreateScraper } from "@web-scraper/common"
import type { ComponentProps } from "react"

type DataKeyFieldProps = Omit<
  ComponentProps<typeof FormInput<CreateScraper>>,
  "label"
> & {
  label?: string
}

export function DataKeyField(props: DataKeyFieldProps) {
  return (
    <FormInput
      placeholder="dataSourceAlias.columnName"
      description="dataSourceAlias must be defined in the scraper's data sources."
      {...props}
      label={props.label ?? "Data Key"}
    />
  )
}
