import type { UpsertScraper } from "@web-scraper/common"
import { useFieldArray, type Control, useWatch } from "react-hook-form"
import { DataKeyField } from "./data-key-field"
import { ScraperValueForm } from "./scraper-value-form"
import { FormSelect } from "@/components/common/form/form-select"
import { Button } from "@/components/shadcn/button"
import { Trash2, Plus, ArrowDownFromLine, ArrowUpFromLine } from "lucide-react"
import { useGet } from "@/hooks/api/useGet"
import { ScraperValueType } from "@web-scraper/common"
import type { ScraperValueFieldName } from "./scraper-value-form"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"

interface SaveDataInstructionFormProps {
  control: Control<UpsertScraper>
  fieldName: `instructions.${number}`
}

export function SaveDataInstructionForm({
  control,
  fieldName,
}: SaveDataInstructionFormProps) {
  return (
    <div className="space-y-4">
      <DataKeyField control={control} name={`${fieldName}.dataKey`} />

      <div>
        <h5 className="font-medium mb-2">Value to save</h5>
        <ScraperValueForm control={control} fieldName={`${fieldName}.value`} />
      </div>
    </div>
  )
}

export function SaveDataBatchInstructionForm({
  control,
  fieldName,
}: SaveDataInstructionFormProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `${fieldName}.items`,
  })

  const dataSources = useWatch({ control, name: "dataSources" })
  const dataSourceName = useWatch({
    control,
    name: `${fieldName}.dataSourceName`,
  })
  const items = useWatch({ control, name: `${fieldName}.items` })
  const selectedColumnNames = (items ?? []).map((item) => item.columnName)

  const selectedDataSource = dataSources.find(
    (ds) => ds.sourceAlias === dataSourceName,
  )
  const selectedTableName = selectedDataSource?.dataStoreTableName ?? ""
  const { data: userDataStore, isLoading } = useGet(
    selectedTableName ? "/user-data-stores/:tableName" : null,
    { tableName: selectedTableName },
  )
  type Column = { name: string }
  const columns: Column[] =
    userDataStore?.data.columns.filter((column) => column.name !== "id") ?? []

  const getAvailableColumns = (currentIdx: number) =>
    columns.filter(
      (col) =>
        !selectedColumnNames.some(
          (name, idx) => name === col.name && idx !== currentIdx,
        ),
    )
  return (
    <div className="space-y-4">
      <DataKeyField
        control={control}
        name={`${fieldName}.dataSourceName`}
        label="Data source alias"
      />
      <div>
        <h5 className="font-medium mb-2">Items to save</h5>
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const availableColumns = getAvailableColumns(index)
            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 items-stretch border rounded-lg p-3 bg-background-darker"
              >
                <div className="flex items-center justify-between">
                  <h6 className="font-medium">Item {index + 1}</h6>
                  <div className="flex items-center gap-1">
                    {fields.length > 1 && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => move(index, index - 1)}
                              disabled={index === 0}
                              className="text-muted-foreground"
                              aria-label="Move up"
                            >
                              <ArrowUpFromLine />
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
                              onClick={() => move(index, index + 1)}
                              disabled={index === fields.length - 1}
                              className="text-muted-foreground"
                              aria-label="Move down"
                            >
                              <ArrowDownFromLine />
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
                          onClick={() => remove(index)}
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
                <FormSelect
                  control={control}
                  name={`${fieldName}.items.${index}.columnName`}
                  label="Column"
                  placeholder="Column name"
                  className="*:[button]:w-full"
                  options={availableColumns.map((col) => ({
                    value: col.name,
                    label: col.name,
                  }))}
                  disabled={isLoading || !columns.length}
                />
                <ScraperValueForm
                  control={control}
                  fieldName={
                    `${fieldName}.items.${index}.value` as ScraperValueFieldName
                  }
                />
              </div>
            )
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              append({
                columnName: "",
                value: { type: ScraperValueType.Literal, value: "" },
              })
            }
            disabled={
              isLoading || !columns.length || fields.length >= columns.length
            }
          >
            <Plus className="size-4" />
            Add Item
          </Button>
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground italic mt-2">
              No items added yet. Click "Add Item" to start.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
