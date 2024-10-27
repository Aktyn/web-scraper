import { yupResolver } from '@hookform/resolvers/yup'
import { mdiChevronLeft, mdiContentSave } from '@mdi/js'
import Icon from '@mdi/react'
import { type UpsertScraperJobSchema, upsertScraperJobSchema } from '@web-scraper/common'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormInput } from '~/components/common/form/form-input'
import { TermInfo } from '~/components/common/term-info'
import { ExecutionForm } from '~/components/scraper-jobs/execution-form'
import { Button } from '~/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { useView } from '~/context/view-context'
import { useApiRequest } from '~/hooks/useApiRequest'
import { cn } from '~/lib/utils'
import { View } from '~/navigation'

export function ScraperJobCreator() {
  const { view, setView } = useView()
  const form = useForm<UpsertScraperJobSchema>({
    resolver: yupResolver(upsertScraperJobSchema),
    mode: 'onSubmit',
    defaultValues: upsertScraperJobSchema.getDefault(),
  })

  const { submit: create, submitting: creating } = useApiRequest(
    window.electronAPI.createScraperJob,
  )

  const onSubmit = useCallback(
    (values: UpsertScraperJobSchema) => {
      console.info('submit:', values) //TODO: remove

      create(
        {
          onSuccess: () => {
            toast.success('Scraper job created successfully')
            setView(View.SCRAPER_JOBS)
          },
        },
        values,
      )
    },
    [create, setView],
  )

  const isOpen = view === View.SCRAPER_JOB_CREATOR
  return (
    <ScrollArea
      className={cn(
        'h-full flex flex-col items-stretch justify-start duration-500',
        isOpen ? 'animate-in slide-in-from-bottom-64' : 'animate-out slide-out-to-bottom-64',
      )}
    >
      <ScrollArea className="p-4 overflow-visible">
        <div className="flex flex-row items-center justify-between min-w-full gap-x-4">
          <span className="text-lg text-muted-foreground font-bold whitespace-nowrap">
            Scraper job creator&nbsp;
            <TermInfo term="job" className="inline size-6 text-muted-foreground align-text-top" />
          </span>
          {/* TODO: run/test button */}
          <Button
            variant="secondary"
            onClick={() => {
              if (isOpen) {
                setView(View.SCRAPER_JOBS)
              }
            }}
          >
            <Icon path={mdiChevronLeft} />
            Return
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Separator />
      <div className="flex flex-col gap-4 py-4 xs:px-4">
        <Form {...form}>
          <form
            id="scraper-job-creator-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4 items-start"
          >
            <div className="flex flex-row flex-wrap items-stretch gap-x-4">
              <FormInput
                control={form.control}
                name="name"
                label="Job name"
                placeholder="Name shortly describing what the job does"
                inputProps={{ className: 'w-80' }}
              />
              <FormInput
                control={form.control}
                name="startUrl"
                label="Start URL"
                placeholder="URL to navigate to before starting the execution"
                inputProps={{ className: 'w-80' }}
              />
              <FormField
                control={form.control}
                name="execution"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Execution</FormLabel>
                    <ExecutionForm {...field} />
                    <FormMessage reserveSpace />
                  </FormItem>
                )}
              />
            </div>
            <Button
              form="scraper-job-creator-form"
              size="lg"
              variant="default"
              type="submit"
              disabled={form.formState.isSubmitted && !form.formState.isValid}
              loading={creating}
            >
              <Icon path={mdiContentSave} />
              Save
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  )
}
