import { type FormInput } from "@/components/common/form/form-input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { useGet } from "@/hooks/api/useGet"
import type { UpsertScraper } from "@web-scraper/common"
import { useMemo, type ComponentProps } from "react"
import { useFormContext, useWatch } from "react-hook-form"

type DataKeyFieldProps = Omit<
  ComponentProps<typeof FormInput<UpsertScraper>>,
  "label"
> & {
  label?: string
}

export function DataKeyField(props: DataKeyFieldProps) {
  const { control } = useFormContext<UpsertScraper>()

  const dataSources = useWatch({ control, name: "dataSources" })
  const dataKey = useWatch({
    control,
    name: props.name as
      | `instructions.${number}.dataKey`
      | `instructions.${number}.dataSourceName`,
  })

  const [aliasValue, columnValue] = dataKey?.split(".") ?? []

  const availableAliases = useMemo(
    () => dataSources.map((ds) => ds.sourceAlias).filter((ds) => !!ds),
    [dataSources],
  )

  const selectedTableName = useMemo(() => {
    const selectedDataSource = dataSources.find(
      (ds) => ds.sourceAlias === aliasValue,
    )
    return selectedDataSource?.dataStoreTableName ?? ""
  }, [dataSources, aliasValue])

  const { data: userDataStore, isLoading } = useGet(
    selectedTableName ? "/user-data-stores/:tableName" : null,
    { tableName: selectedTableName },
  )

  const isDeleteInstruction = props.name.endsWith("dataSourceName")

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {props.label ??
              (isDeleteInstruction ? "Source to delete row from" : "Data key")}
          </FormLabel>
          <FormControl>
            <div className="flex flex-row items-center gap-2 *:not-[span]:flex-1">
              <Select
                value={aliasValue ?? ""}
                disabled={!availableAliases.length}
                onValueChange={(value) => {
                  if (isDeleteInstruction) {
                    field.onChange(value)
                  } else {
                    field.onChange(`${value}.${columnValue ?? ""}`)
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Data source alias" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableAliases.map((alias) => (
                    <SelectItem key={alias} value={alias}>
                      {alias}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isDeleteInstruction && (
                <>
                  <span className="self-end">.</span>
                  <Select
                    value={aliasValue ? (columnValue ?? "") : ""}
                    disabled={
                      !availableAliases.length || !aliasValue || isLoading
                    }
                    onValueChange={(value) => {
                      if (!aliasValue) {
                        return
                      }
                      field.onChange(`${aliasValue}.${value ?? ""}`)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Column name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userDataStore?.data.columns.map((column) => (
                        <SelectItem key={column.name} value={column.name}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </FormControl>
          <FormDescription>
            {dataSources.length ? (
              <span>
                {aliasValue ? (
                  <b className="text-success-foreground-light">{aliasValue}</b>
                ) : (
                  "dataSourceAlias"
                )}
                {!isDeleteInstruction && (
                  <>
                    <span>.</span>
                    {columnValue ? (
                      <b className="text-success-foreground-light">
                        {columnValue}
                      </b>
                    ) : (
                      <span className="text-muted-foreground">columnName</span>
                    )}
                  </>
                )}
              </span>
            ) : (
              <span className="text-warning">
                No data sources defined. Please add a data source first.
              </span>
            )}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
