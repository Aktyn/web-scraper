import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Input } from "@/components/shadcn/input"
import { ScrollArea } from "@/components/shadcn/scroll-area"
import { usePost } from "@/hooks/api/usePost"
import { usePut } from "@/hooks/api/usePut"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createUserDataStoreSchema,
  SqliteColumnType,
  type CreateUserDataStore,
  type UserDataStore,
} from "@web-scraper/common"
import { AlertTriangle, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { FormInput } from "../common/form/form-input"
import { FormSelect } from "../common/form/form-select"
import { FormSwitch } from "../common/form/form-switch"
import { TermInfo } from "../info/term-info"

const columnTypeOptions = [
  { value: SqliteColumnType.TEXT, label: "Text" },
  { value: SqliteColumnType.INTEGER, label: "Integer" },
  { value: SqliteColumnType.REAL, label: "Real" },
  { value: SqliteColumnType.NUMERIC, label: "Numeric" },
  { value: SqliteColumnType.BOOLEAN, label: "Boolean" },
  { value: SqliteColumnType.TIMESTAMP, label: "Timestamp" },
  { value: SqliteColumnType.BLOB, label: "Blob" },
]

interface DataStoreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (store: UserDataStore) => void
  editStore?: UserDataStore | null
}

export function DataStoreFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editStore,
}: DataStoreFormDialogProps) {
  const { postItem, isPosting } = usePost("/user-data-stores")
  const { putItem, isPutting } = usePut("/user-data-stores/:tableName")

  const isEditing = !!editStore
  const showColumnsEditWarning = isEditing && editStore.recordsCount > 0

  const form = useForm<CreateUserDataStore>({
    resolver: zodResolver(createUserDataStoreSchema),
    defaultValues: editStore
      ? {
          name: editStore.name,
          description: editStore.description,
          columns: editStore.columns.filter((column) => column.name !== "id"),
        }
      : {
          name: "",
          description: "",
          columns: [
            {
              name: "",
              type: SqliteColumnType.TEXT,
              notNull: false,
              defaultValue: null,
            },
          ],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "columns",
  })

  useEffect(() => {
    if (open) {
      if (editStore) {
        form.reset({
          name: editStore.name,
          description: editStore.description,
          columns: editStore.columns.filter((column) => column.name !== "id"),
        })
      } else {
        form.reset({
          name: "",
          description: "",
          columns: [
            {
              name: "",
              type: SqliteColumnType.TEXT,
              notNull: false,
              defaultValue: null,
            },
          ],
        })
      }
    }
  }, [open, editStore, form])

  const onSubmit = async (data: CreateUserDataStore) => {
    const cleanedData = {
      ...data,
      description: data.description?.trim() || null,
      columns: data.columns.map((column) => ({
        ...column,
        defaultValue: column.defaultValue === "" ? null : column.defaultValue,
      })),
    }

    let result
    if (isEditing && editStore) {
      result = await putItem(cleanedData, { tableName: editStore.tableName })
    } else {
      result = await postItem(cleanedData)
    }

    if (result) {
      form.reset()
      onOpenChange(false)
      onSuccess?.(result.data)
    }
  }

  const addColumn = () => {
    append({
      name: "",
      type: SqliteColumnType.TEXT,
      notNull: false,
      defaultValue: null,
    })
  }

  const removeColumn = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            {isEditing ? "Edit Data Store" : "Create Data Store"}
            <TermInfo term="dataStore" />
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the data store configuration. Note: Changing column structure may affect existing data."
              : "Create a new data store with custom columns to store your scraped data."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-m-6 **:[form]:p-6 overflow-hidden mask-t-from-[calc(100%-var(--spacing)*8)] mask-b-from-[calc(100%-var(--spacing)*8)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter data store name"
                description="A unique name for your data store."
              />

              <FormInput
                control={form.control}
                name="description"
                label="Description (optional)"
                placeholder="Enter description"
                description="A brief description of what this data store will contain."
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Columns</h3>
                    <p className="text-sm text-muted-foreground">
                      Define the structure of your data store.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColumn}
                  >
                    <Plus className="size-4" />
                    Add Column
                  </Button>
                </div>
                {showColumnsEditWarning && (
                  <div className="flex items-center gap-2 bg-warning/20 text-warning-foreground border border-warning p-2 rounded-lg">
                    <AlertTriangle className="size-8" />
                    <p className="text-pretty">
                      Changing the column structure will remove all existing
                      data.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Column {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColumn(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          control={form.control}
                          name={`columns.${index}.name`}
                          label="Column name"
                          placeholder="e.g., title, price, url"
                        />

                        <FormSelect
                          control={form.control}
                          name={`columns.${index}.type`}
                          label="Data type"
                          placeholder="Select data type"
                          options={columnTypeOptions}
                          className="*:[button]:w-full"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSwitch
                          control={form.control}
                          name={`columns.${index}.notNull`}
                          label="Required"
                          description="This column cannot be empty"
                          className="flex-row flex-wrap items-center gap-2 rounded-lg border p-3 *:data-[slot=form-description]:w-full"
                        />

                        <FormField
                          control={form.control}
                          name={`columns.${index}.defaultValue`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Value (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter default value"
                                  {...field}
                                  value={field.value?.toString() || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(value === "" ? null : value)
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Default value for this column
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                <Button
                  type="submit"
                  disabled={isPosting || isPutting}
                  className={cn(
                    showColumnsEditWarning &&
                      "bg-warning hover:bg-warning-foreground",
                  )}
                >
                  {showColumnsEditWarning && <AlertTriangle />}
                  {isEditing
                    ? isPutting
                      ? "Updating..."
                      : "Update Data Store"
                    : isPosting
                      ? "Creating..."
                      : "Create Data Store"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
