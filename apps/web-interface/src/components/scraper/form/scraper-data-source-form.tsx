import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import type { CreateScraper, UserDataStore } from "@web-scraper/common"
import type { Control, FieldValues } from "react-hook-form"

interface ScraperDataSourceFormProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  index: number
  dataStores: UserDataStore[]
}

export function ScraperDataSourceForm({
  control,
  index,
  dataStores,
}: ScraperDataSourceFormProps<CreateScraper>) {
  const dataStoreOptions = dataStores.map((store) => ({
    value: store.tableName,
    label: store.name,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* TODO: implement auto-complete search with dynamic data fetching */}
      <FormSelect
        control={control}
        className="*:[button]:w-full"
        name={`dataSources.${index}.dataStoreTableName`}
        label="Data Store"
        placeholder="Select data store"
        options={dataStoreOptions}
        description="The data store table to read from."
      />

      <FormInput
        control={control}
        name={`dataSources.${index}.sourceAlias`}
        label="Source alias"
        placeholder="e.g., credentials, products"
        description="Alias to reference this data source in instructions."
      />

      {/* TODO: Add WHERE schema form */}
      {/* For now, whereSchema is always null */}
    </div>
  )
}
