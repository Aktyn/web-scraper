import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import type { UpsertScraper, UserDataStore } from "@web-scraper/common"
import type { Control, FieldValues } from "react-hook-form"
import { useWatch } from "react-hook-form"
import { useMemo } from "react"
import { WhereSchemaForm } from "./where-schema-form"

interface ScraperDataSourceFormProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  index: number
  dataStores: UserDataStore[]
}

export function ScraperDataSourceForm({
  control,
  index,
  dataStores,
}: ScraperDataSourceFormProps<UpsertScraper>) {
  const selectedTableName = useWatch({
    control,
    name: `dataSources.${index}.dataStoreTableName`,
  })

  const selectedDataStore = useMemo(() => {
    return dataStores.find((store) => store.tableName === selectedTableName)
  }, [dataStores, selectedTableName])

  const dataStoreOptions = dataStores.map((store) => ({
    value: store.tableName,
    label: store.name,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row flex-wrap items-start gap-4 *:flex-1 *:basis-1/2">
        {/* TODO: implement auto-complete search with dynamic data fetching */}
        <FormSelect
          control={control}
          className="*:[button]:w-full"
          name={`dataSources.${index}.dataStoreTableName`}
          label="Data store"
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
      </div>

      {selectedDataStore && (
        <WhereSchemaForm
          control={control}
          name={`dataSources.${index}.whereSchema`}
          columns={selectedDataStore.columns}
          dataSourceIndex={index}
        />
      )}
    </div>
  )
}
