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
import type { CreateScraper } from "@web-scraper/common"
import { useMemo, type ComponentProps } from "react"
import { useFormContext } from "react-hook-form"

type DataKeyFieldProps = Omit<
  ComponentProps<typeof FormInput<CreateScraper>>,
  "label"
> & {
  label?: string
}

export function DataKeyField(props: DataKeyFieldProps) {
  const { control, watch } = useFormContext<CreateScraper>()

  const dataSources = watch("dataSources")
  const dataKey = watch(props.name as `instructions.${number}.dataKey`)

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

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label ?? "Data Key"}</FormLabel>
          <FormControl>
            <div className="flex flex-row items-center gap-2 *:not-[span]:flex-1">
              <Select
                value={aliasValue ?? ""}
                disabled={!availableAliases.length}
                onValueChange={(value) => {
                  field.onChange(`${value}.${columnValue ?? ""}`)
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
              <span className="self-end">.</span>
              <Select
                value={aliasValue ? (columnValue ?? "") : ""}
                disabled={!aliasValue || isLoading}
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
            </div>
          </FormControl>
          <FormDescription>
            {dataSources.length ? (
              <span>
                {aliasValue ? (
                  <b className="text-success-foreground">{aliasValue}</b>
                ) : (
                  "dataSourceAlias"
                )}
                <span>.</span>
                {columnValue ? (
                  <b className="text-success-foreground">{columnValue}</b>
                ) : (
                  <span className="text-muted-foreground">columnName</span>
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
    // <FormInput
    //   placeholder="dataSourceAlias.columnName"
    //   description={
    //     dataSources.length ? (
    //       "dataSourceAlias must be defined in the scraper's data sources."
    //     ) : (
    //       <span className="text-warning">
    //         No data sources defined. Please add a data source first.
    //       </span>
    //     )
    //   }
    //   disabled={!dataSources.length}
    //   {...props}
    //   label={props.label ?? "Data Key"}
    // />
  )
}
