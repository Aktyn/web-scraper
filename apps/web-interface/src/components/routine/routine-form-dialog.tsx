import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import { Form, FormItem, FormLabel } from "@/components/shadcn/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { ScrollArea } from "@/components/shadcn/scroll-area"
import { useGet } from "@/hooks/api/useGet"
import { usePost } from "@/hooks/api/usePost"
import { usePut } from "@/hooks/api/usePut"
import { formatDateTime } from "@/lib/utils.js"
import { zodResolver } from "@hookform/resolvers/zod"
import type {
  ExecutionIterator,
  Routine,
  UpsertRoutine,
} from "@web-scraper/common"
import { SchedulerType, upsertRoutineSchema } from "@web-scraper/common"
import { CalendarIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { Control } from "react-hook-form"
import { Controller, useForm, useWatch } from "react-hook-form"
import { DateTimePicker } from "../common/form/datetime-picker.js"
import { FormInput } from "../common/form/form-input.js"
import { FormInterval } from "../common/form/form-interval.js"
import { FormScraperSelect } from "../common/form/form-scraper-select.js"
import { FormTextarea } from "../common/form/form-textarea.js"
import { IteratorDescription } from "../iterator/iterator-description.js"
import { IteratorFormDialog } from "../iterator/iterator-form-dialog.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip.js"
import { TermInfo } from "../info/term-info.js"

const HOUR_IN_MS = 3_600_000

interface RoutineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (routine: Routine) => void
  editRoutine?: Routine | null
}

export function RoutineFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editRoutine,
}: RoutineFormDialogProps) {
  const { postItem, isPosting } = usePost("/routines")
  const { putItem, isPutting } = usePut("/routines/:id")

  const [isIteratorDialogOpen, setIsIteratorDialogOpen] = useState(false)

  const isEditing = !!editRoutine && editRoutine.id !== -1

  const form = useForm<UpsertRoutine>({
    resolver: zodResolver(upsertRoutineSchema),
    defaultValues: editRoutine
      ? {
          ...editRoutine,
          scheduler: {
            ...editRoutine.scheduler,
            startAt: new Date(editRoutine.scheduler.startAt).getTime(),
            endAt: editRoutine.scheduler.endAt
              ? new Date(editRoutine.scheduler.endAt).getTime()
              : null,
          },
        }
      : {
          description: "",
          scheduler: {
            type: SchedulerType.Interval,
            interval: HOUR_IN_MS,
            startAt: new Date().getTime(),
            endAt: null,
          },
          iterator: null,
          pauseAfterNumberOfFailedExecutions: 5,
        },
  })

  const [iterator, setIterator] = useState<ExecutionIterator | null>(
    form.getValues("iterator"),
  )

  useEffect(() => {
    form.setValue("iterator", iterator, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [iterator, form])

  useEffect(() => {
    if (open) {
      if (editRoutine) {
        form.reset({
          ...editRoutine,
          scheduler: {
            ...editRoutine.scheduler,
            startAt: new Date(editRoutine.scheduler.startAt).getTime(),
            endAt: editRoutine.scheduler.endAt
              ? new Date(editRoutine.scheduler.endAt).getTime()
              : null,
          },
        })
        setIterator(editRoutine.iterator)
      } else {
        form.reset({
          description: "",
          scraperId: undefined,
          scheduler: {
            type: SchedulerType.Interval,
            interval: HOUR_IN_MS,
            startAt: new Date().getTime(),
            endAt: null,
          },
          iterator: null,
          pauseAfterNumberOfFailedExecutions: 5,
        })
        setIterator(null)
      }
    }
  }, [open, editRoutine, form])

  const onSubmit = async (data: UpsertRoutine) => {
    const cleanedData = {
      ...data,
      description: data.description?.trim() || null,
    }

    let result
    if (isEditing && editRoutine) {
      result = await putItem(cleanedData, { id: editRoutine.id })
    } else {
      result = await postItem(cleanedData)
    }

    if (result) {
      form.reset()
      onOpenChange(false)
      onSuccess?.(result.data)
    }
  }

  const scraperId = useWatch({ control: form.control, name: "scraperId" })

  const { data: scraperData, isLoading: isScraperDataLoading } = useGet(
    scraperId ? "/scrapers/:id" : null,
    {
      id: scraperId,
    },
  )

  const selectedScraper = scraperData?.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            {isEditing ? "Edit Routine" : "Create Routine"}
            <TermInfo term="routine" />
          </DialogTitle>
          <DialogDescription>
            Routine allows you to schedule scraper executions at defined
            intervals.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-m-6 **:[form]:p-6 overflow-hidden mask-t-from-[calc(100%-var(--spacing)*8)] mask-b-from-[calc(100%-var(--spacing)*8)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, console.error)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic information</h3>

                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Description (optional)"
                  placeholder="Enter description"
                  description="A brief description of the routine's purpose."
                />
                <FormScraperSelect
                  control={form.control}
                  name="scraperId"
                  className="*:[button]:w-full"
                  disabled={isEditing}
                  selectProps={{
                    onValueChange: () => {
                      setIterator(null)
                    },
                  }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Scheduler (Interval based)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DateTimePickerFormField
                    control={form.control}
                    name="scheduler.startAt"
                    label="Start at"
                  />
                  <DateTimePickerFormField
                    control={form.control}
                    name="scheduler.endAt"
                    label="End at (optional)"
                    clearable
                  />
                </div>
                <FormInterval
                  control={form.control}
                  name="scheduler.interval"
                  label="Interval"
                  description="The interval at which the scraper will execute after the start datetime."
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution</h3>
                <FormInput
                  control={form.control}
                  name="pauseAfterNumberOfFailedExecutions"
                  label="Pause after # of failed executions"
                  type="number"
                  inputProps={{ min: 1 }}
                  placeholder="e.g. 5"
                  description="The routine will be paused after this many consecutive failed executions."
                />

                <FormItem>
                  <FormLabel>Iterator (optional)</FormLabel>
                  <div className="flex flex-col items-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsIteratorDialogOpen(true)}
                      disabled={
                        !selectedScraper ||
                        !selectedScraper.dataSources.length ||
                        isScraperDataLoading
                      }
                    >
                      {iterator ? "Edit iterator" : "Add iterator"}
                    </Button>
                    {iterator && <IteratorDescription iterator={iterator} />}
                  </div>
                </FormItem>
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
                      : "Update Routine"
                    : isPosting
                      ? "Creating..."
                      : "Create Routine"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
        {selectedScraper && (
          <IteratorFormDialog
            open={isIteratorDialogOpen}
            onOpenChange={setIsIteratorDialogOpen}
            iterator={iterator}
            onChange={setIterator}
            dataSources={selectedScraper.dataSources}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type DateTimePickerFormFieldProps = {
  control: Control<UpsertRoutine>
  name: `scheduler.startAt` | `scheduler.endAt`
  label: string
  clearable?: boolean
}

function DateTimePickerFormField({
  control,
  name,
  label,
  clearable,
}: DateTimePickerFormFieldProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col items-start gap-2">
          <FormLabel>{label}</FormLabel>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <div>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    <div className="flex items-center justify-between gap-2 w-full">
                      {formatDateTime(new Date(field.value))}
                      {clearable && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                field.onChange(null)
                              }}
                            >
                              <X />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Clear</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <DateTimePicker
                value={field.value ? new Date(field.value) : null}
                onSelect={(date) => {
                  field.onChange(date.getTime())
                  setPopoverOpen(false)
                }}
                onCancel={() => {
                  if (name.endsWith("endAt")) {
                    field.onChange(null)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  )
}
