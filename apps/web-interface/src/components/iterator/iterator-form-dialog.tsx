import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import { Form, FormField } from "@/components/shadcn/form"
import { Label } from "@/components/shadcn/label"
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group"
import { ScrollArea } from "@/components/shadcn/scroll-area"
import { useGet } from "@/hooks/api/useGet"
import { executionIteratorTypeLabels } from "@/lib/dictionaries"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ExecutionIterator, ScraperDataSource } from "@web-scraper/common"
import {
  executionIteratorSchema,
  ExecutionIteratorType,
} from "@web-scraper/common"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useFormContext, useWatch } from "react-hook-form"
import { mapToSelectOptions } from "../scraper/form/helpers"
import { WhereSchemaForm } from "../scraper/form/where-schema-form"
import { TermInfo } from "../info/term-info"

interface IteratorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  iterator: ExecutionIterator | null
  onChange: Dispatch<SetStateAction<ExecutionIterator | null>>
  dataSources: ScraperDataSource[]
}

const iteratorTypeOptions = mapToSelectOptions(executionIteratorTypeLabels)

export function IteratorFormDialog({
  open,
  onOpenChange,
  iterator,
  onChange,
  dataSources,
}: IteratorFormDialogProps) {
  const form = useForm<ExecutionIterator>({
    resolver: zodResolver(executionIteratorSchema),
    defaultValues: iterator ?? {
      type: ExecutionIteratorType.Range,
      dataSourceName: "",
      identifier: "id",
      range: 1,
    },
  })

  const [type, setType] = useState<ExecutionIterator["type"]>(
    form.getValues("type"),
  )

  const { reset } = form
  useEffect(() => {
    if (!open) {
      return
    }

    reset(
      iterator ?? {
        type: ExecutionIteratorType.Range,
        dataSourceName: "",
        identifier: "id",
        range: 1,
      },
    )
    setType(iterator?.type ?? ExecutionIteratorType.Range)
  }, [iterator, reset, open])

  const onSubmit = (data: ExecutionIterator) => {
    onChange(data as ExecutionIterator)
    onOpenChange(false)
  }

  const onRemove = () => {
    onChange(null)
    onOpenChange(false)
  }

  const dataSourceOptions = useMemo(
    () =>
      dataSources.map((ds) => ({
        value: ds.sourceAlias,
        label: ds.sourceAlias,
      })),
    [dataSources],
  )

  const onTypeChange = (type: ExecutionIteratorType) => {
    const common = {
      dataSourceName: form.getValues("dataSourceName"),
    }
    switch (type) {
      case ExecutionIteratorType.Range:
        reset({ ...common, type, identifier: "id", range: 1 })
        break
      case ExecutionIteratorType.EntireSet:
        reset({ ...common, type })
        break
      case ExecutionIteratorType.FilteredSet:
        reset({ ...common, type, where: { and: [], negate: false } })
        break
      default:
        throw new Error(`Unknown iterator type: ${type}`)
    }
    setType(type)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto grid grid-rows-[auto_1fr_auto]"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <span>Execution iterator</span>
            <TermInfo term="iterator" />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="-m-6 **:[form]:p-6 overflow-hidden mask-t-from-[calc(100%-var(--spacing)*8)] mask-b-from-[calc(100%-var(--spacing)*8)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, console.error)}
              className="flex flex-col gap-6 items-stretch"
            >
              <FormSelect
                control={form.control}
                name="type"
                label="Iterator type"
                options={iteratorTypeOptions}
                className="*:[button]:w-full"
                selectProps={{
                  onValueChange: (value) =>
                    onTypeChange(value as ExecutionIteratorType),
                }}
              />
              <FormSelect
                control={form.control}
                name="dataSourceName"
                label="Data Source"
                options={dataSourceOptions}
                className="*:[button]:w-full"
              />

              {type === ExecutionIteratorType.Range && (
                <RangeFields dataSources={dataSources} />
              )}
              {type === ExecutionIteratorType.FilteredSet && (
                <IteratorWhereSchemaForm dataSources={dataSources} />
              )}
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={!form.formState.isDirty}
          >
            Discard
          </Button>
          {iterator && (
            <Button type="button" variant="destructive" onClick={onRemove}>
              Remove
            </Button>
          )}
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function IteratorWhereSchemaForm({
  dataSources,
}: Pick<IteratorFormDialogProps, "dataSources">) {
  const { control } = useFormContext<ExecutionIterator>()
  const { columns } = useDataSourceColumns(dataSources)

  return <WhereSchemaForm control={control} name="where" columns={columns} />
}

function RangeFields({
  dataSources,
}: Pick<IteratorFormDialogProps, "dataSources">) {
  const { control } = useFormContext<ExecutionIterator>()
  const range = useWatch({ control, name: "range" })

  const [rangeType, setRangeType] = useState<"number" | "object">(
    typeof range === "number" ? "number" : "object",
  )

  useEffect(() => {
    setRangeType(typeof range === "number" ? "number" : "object")
  }, [range])

  const { columns, recordsCount } = useDataSourceColumns(dataSources)

  return (
    <div className="space-y-4">
      <FormSelect
        control={control}
        className="*:[button]:w-full"
        name="identifier"
        label="Identifier"
        placeholder="Select identifier column"
        options={columns.map((c) => ({
          value: c.name,
          label: c.name,
        }))}
        description="The data store table to read from."
      />
      <RadioGroup
        defaultValue={rangeType}
        onValueChange={(v: "number" | "object") => setRangeType(v)}
        className="grid grid-cols-2 *:[label]:transition-colors"
      >
        <Label
          className="font-normal flex items-center gap-2 border rounded-md p-4 has-[:checked]:bg-primary/25 has-[:checked]:text-foreground-lighter has-[:checked]:border-primary"
          htmlFor="number"
        >
          <RadioGroupItem value="number" id="number" />
          Specific identifier value
        </Label>
        <Label
          className="font-normal flex items-center gap-2 border rounded-md p-4 has-[:checked]:bg-primary/25 has-[:checked]:text-foreground-lighter has-[:checked]:border-primary"
          htmlFor="range"
        >
          <RadioGroupItem value="object" id="range" />
          For each in range
        </Label>
      </RadioGroup>
      {rangeType === "number" ? (
        <FormInput
          control={control}
          name="range"
          label="Identifier value"
          type="number"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <p>
            <b>{recordsCount}</b> records found in the data source.
          </p>
          <FormField
            control={control}
            name="range"
            render={() => (
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  control={control}
                  name="range.start"
                  label="Start"
                  type="number"
                  inputProps={{
                    min: 1,
                    max: recordsCount,
                  }}
                />
                <FormInput
                  control={control}
                  name="range.end"
                  label="End"
                  type="number"
                  inputProps={{
                    min: 1,
                    max: recordsCount,
                  }}
                />
                <FormInput
                  control={control}
                  name="range.step"
                  label="Step"
                  type="number"
                  inputProps={{
                    min: 1,
                  }}
                />
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}

function useDataSourceColumns(dataSources: ScraperDataSource[]) {
  const { control } = useFormContext<ExecutionIterator>()
  const selectedDataSourceName = useWatch({ control, name: "dataSourceName" })

  const selectedDataSource = useMemo(
    () =>
      dataSources.find((ds) => ds.sourceAlias === selectedDataSourceName) ??
      null,
    [dataSources, selectedDataSourceName],
  )

  const { data: userDataStore } = useGet(
    selectedDataSource ? "/user-data-stores/:tableName" : null,
    { tableName: selectedDataSource?.dataStoreTableName ?? "" },
  )

  return {
    recordsCount: userDataStore?.data.recordsCount ?? 0,
    columns: userDataStore?.data.columns ?? [],
  }
}
