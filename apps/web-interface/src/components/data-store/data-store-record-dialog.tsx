import { usePost } from "@/hooks/api/usePost"
import { usePut } from "@/hooks/api/usePut"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  SqliteColumnType,
  upsertUserDataStoreRecordSchemaFactory,
  type UpsertUserDataStoreRecord,
  type UserDataStore,
  type UserDataStoreColumn,
} from "@web-scraper/common"
import { Delete, Download } from "lucide-react"
import { useEffect } from "react"
import { useForm, type Control, type FieldValues } from "react-hook-form"
import { DateTimePickerButton } from "../common/button/datetime-picker-button"
import { FormInput } from "../common/form/form-input"
import { Badge } from "../shadcn/badge"
import { Button } from "../shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../shadcn/form"
import { Input } from "../shadcn/input"
import { ScrollArea } from "../shadcn/scroll-area"
import { Switch } from "../shadcn/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"

type DataStoreRecordDialogProps = {
  store: UserDataStore
  editRecord?: Record<string, unknown> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (record: Record<string, unknown>) => void
}

export function DataStoreRecordDialog({
  store,
  editRecord,
  open,
  onOpenChange,
  onSuccess,
}: DataStoreRecordDialogProps) {
  const { postItem, isPosting } = usePost(
    "/user-data-stores/:tableName/records",
  )
  const { putItem, isPutting } = usePut(
    "/user-data-stores/:tableName/records/:id",
  )

  const isEditing = !!editRecord

  const schema = upsertUserDataStoreRecordSchemaFactory(store.columns)

  const form = useForm<UpsertUserDataStoreRecord>({
    resolver: standardSchemaResolver(schema),
    defaultValues: editRecord ? { ...editRecord } : {},
  })

  useEffect(() => {
    if (open) {
      if (editRecord) {
        form.reset(editRecord)
      } else {
        form.reset(
          store.columns.reduce(
            (acc, column) => {
              if (!column.notNull) {
                acc[column.name] = null
              } else {
                acc[column.name] = column.defaultValue
              }
              return acc
            },
            {} as Record<string, unknown>,
          ),
        )
      }
    }
  }, [editRecord, form, open, store.columns])

  const onSubmit = async (data: UpsertUserDataStoreRecord) => {
    const cleanedData = store.columns.reduce(
      (acc, column) => {
        if (column.name === "id") {
          return acc
        }

        if (typeof data[column.name] === "string") {
          data[column.name] = (data[column.name] as string).trim()
        }

        if (column.notNull) {
          acc[column.name] = data[column.name]
        } else {
          acc[column.name] =
            (data[column.name] === "" ? null : data[column.name]) ??
            column.defaultValue
        }
        return acc
      },
      {} as Record<string, unknown>,
    )

    let result
    if (isEditing && editRecord) {
      result = await putItem(cleanedData, {
        tableName: store.tableName,
        id: editRecord.id as number,
      })
    } else {
      result = await postItem(cleanedData, { tableName: store.tableName })
    }

    if (result) {
      form.reset()
      onOpenChange(false)
      onSuccess?.(result.data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Data Store" : "Create Data Store"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the data store configuration. Note: Changing column structure may affect existing data."
              : "Create a new data store with custom columns to store your scraped data."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-m-6 **:[form]:p-6 overflow-hidden mask-t-from-[calc(100%-var(--spacing)*8)] mask-b-from-[calc(100%-var(--spacing)*8)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, console.error)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-4">
                {store.columns.map((column) => (
                  <ValueField
                    key={column.name}
                    column={column}
                    control={form.control}
                  />
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPosting || isPutting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPosting || isPutting}>
                  {isEditing
                    ? isPutting
                      ? "Updating..."
                      : "Update Data Store record"
                    : isPosting
                      ? "Creating..."
                      : "Create Data Store record"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

type ValueFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  column: UserDataStoreColumn
  control: Control<TFieldValues>
}

function ValueField({
  column,
  control,
}: ValueFieldProps<Record<string, unknown>>) {
  if (column.name === "id") {
    return null
  }

  const labelWithNullable = (
    <div className="flex items-center gap-2">
      <span>{column.name}</span>
      {!column.notNull && <Badge variant="outline">Nullable</Badge>}
    </div>
  )

  const placeholder = column.defaultValue
    ? `Default value: ${column.defaultValue}`
    : "Input value here"

  switch (column.type) {
    case SqliteColumnType.TEXT:
      return (
        <FormInput
          control={control}
          name={column.name}
          label={labelWithNullable}
          placeholder={placeholder}
        />
      )

    case SqliteColumnType.INTEGER:
      return (
        <FormInput
          control={control}
          name={column.name}
          label={labelWithNullable}
          type="number"
          placeholder={placeholder}
          inputProps={{
            onChange: (event) => {
              const value = event.target.value
              event.target.value =
                value === "" ? value : parseInt(value, 10).toString()
            },
          }}
        />
      )

    case SqliteColumnType.REAL:
    case SqliteColumnType.NUMERIC:
      return (
        <FormInput
          control={control}
          name={column.name}
          label={labelWithNullable}
          type="number"
          placeholder={placeholder}
        />
      )

    case SqliteColumnType.TIMESTAMP:
      return (
        <FormInput
          control={control}
          name={column.name}
          label={labelWithNullable}
          type="number"
          placeholder={placeholder}
          endAdornment={<DateTimePickerButton name={column.name} />}
        />
      )

    case SqliteColumnType.BOOLEAN:
      return (
        <FormField
          control={control}
          name={column.name}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{labelWithNullable}</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case SqliteColumnType.BLOB:
      return (
        <FormField
          control={control}
          name={column.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labelWithNullable}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="file"
                    multiple={false}
                    className="pr-32"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => {
                          if (typeof reader.result !== "string") {
                            throw new Error("FileReader result is not a string")
                          }
                          field.onChange(reader.result)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    placeholder="Select a file"
                  />
                  {field.value ? (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2 gap-2 border-l">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-6"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()

                              fetch(field.value as string)
                                .then((response) => response.blob())
                                .then((blob) => {
                                  const url = URL.createObjectURL(blob)
                                  window.open(url, "_blank")
                                })
                                .catch(console.error)
                            }}
                          >
                            <Download />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download file</TooltipContent>
                      </Tooltip>
                      {!column.notNull && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            field.onChange(null)
                          }}
                        >
                          <Delete />
                          Clear
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    default:
      return (
        <FormInput
          control={control}
          name={column.name}
          label={labelWithNullable}
          placeholder={placeholder}
        />
      )
  }
}
