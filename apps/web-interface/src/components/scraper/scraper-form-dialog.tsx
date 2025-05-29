import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import { Form } from "@/components/shadcn/form"
import { ScrollArea } from "@/components/shadcn/scroll-area"
import { useGet } from "@/hooks/api/useGet"
import { usePost } from "@/hooks/api/usePost"
import { usePut } from "@/hooks/api/usePut"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  type CreateScraper,
  createScraperSchema,
  PageActionType,
  ScraperInstructionType,
  type ScraperType,
} from "@web-scraper/common"
import { Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { FormInput } from "../common/form/form-input"
import { ScraperDataSourceForm } from "./form/scraper-data-source-form"
import { ScraperInstructionsForm } from "./form/scraper-instructions-form"

interface ScraperFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (scraper: ScraperType) => void
  editScraper?: ScraperType | null
}

export function ScraperFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editScraper,
}: ScraperFormDialogProps) {
  const { postItem, isPosting } = usePost("/scrapers")
  const { putItem, isPutting } = usePut("/scrapers/:id")
  const { data: dataStoresResponse } = useGet("/user-data-stores")

  const isEditing = !!editScraper
  const dataStores = dataStoresResponse?.data || []

  const form = useForm<CreateScraper>({
    resolver: zodResolver(createScraperSchema),
    defaultValues: editScraper
      ? {
          name: editScraper.name,
          description: editScraper.description,
          userDataDirectory: editScraper.userDataDirectory,
          dataSources: editScraper.dataSources,
          instructions: editScraper.instructions,
        }
      : {
          name: "",
          description: "",
          userDataDirectory: "",
          dataSources: [],
          instructions: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Navigate,
                url: "",
              },
            },
          ],
        },
  })

  const {
    fields: dataSourceFields,
    append: appendDataSource,
    remove: removeDataSource,
  } = useFieldArray({
    control: form.control,
    name: "dataSources",
  })

  useEffect(() => {
    if (open) {
      if (editScraper) {
        form.reset({
          name: editScraper.name,
          description: editScraper.description,
          userDataDirectory: editScraper.userDataDirectory,
          dataSources: editScraper.dataSources,
          instructions: editScraper.instructions,
        })
      } else {
        form.reset({
          name: "",
          description: "",
          userDataDirectory: "",
          dataSources: [],
          instructions: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Navigate,
                url: "",
              },
            },
          ],
        })
      }
    }
  }, [open, editScraper, form])

  const onSubmit = async (data: CreateScraper) => {
    const cleanedData = {
      ...data,
      description: data.description?.trim() || null,
      userDataDirectory: data.userDataDirectory?.trim() || null,
    }

    let result
    if (isEditing && editScraper) {
      result = await putItem(cleanedData, { id: editScraper.id })
    } else {
      result = await postItem(cleanedData)
    }

    if (result) {
      form.reset()
      onOpenChange(false)
      onSuccess?.(result.data)
    }
  }

  const addDataSource = () => {
    appendDataSource({
      dataStoreTableName: "",
      sourceAlias: "",
      whereSchema: null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-4xl max-h-[90vh] overflow-y-auto grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Scraper" : "Create Scraper"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the scraper instructions and its data sources"
              : "Create a new scraper for later use"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-m-6 **:[form]:p-6 overflow-hidden mask-t-from-[calc(100%-var(--spacing)*8)] mask-b-from-[calc(100%-var(--spacing)*8)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic information</h3>

                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Enter scraper name"
                  description="A unique name for your scraper."
                />

                <FormInput
                  control={form.control}
                  name="description"
                  label="Description (Optional)"
                  placeholder="Enter description"
                  description="A brief description of what this scraper does."
                />

                <FormInput
                  control={form.control}
                  name="userDataDirectory"
                  label="User Data Directory (Optional)"
                  placeholder="e.g., /path/to/custom/userData"
                  description="Custom Chrome user data directory path."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Data Sources</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure external data sources for this scraper.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addDataSource}>
                    <Plus className="size-4" />
                    Add Data Source
                  </Button>
                </div>

                {dataSourceFields.length > 0 && (
                  <div className="space-y-4">
                    {dataSourceFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Data Source {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDataSource(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <ScraperDataSourceForm
                          control={form.control}
                          index={index}
                          dataStores={dataStores}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-stretch gap-4">
                <div>
                  <h3 className="text-lg font-medium">Instructions</h3>
                  <p className="text-sm text-muted-foreground">
                    Define the scraper's behavior step by step.
                  </p>
                </div>

                <ScraperInstructionsForm control={form.control} />
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
                      : "Update Scraper"
                    : isPosting
                      ? "Creating..."
                      : "Create Scraper"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
