import { yupResolver } from '@hookform/resolvers/yup'
import { mdiChevronLeft } from '@mdi/js'
import Icon from '@mdi/react'
import {
  generateUUID,
  type UpsertScraperJobSchema,
  upsertScraperJobSchema,
} from '@web-scraper/common'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { TermInfo } from '~/components/common/term-info'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { useView } from '~/context/view-context'
import { cn } from '~/lib/utils'
import { View } from '~/navigation'

export function ScraperJobCreator() {
  const { view, setView } = useView()
  const form = useForm<UpsertScraperJobSchema>({
    resolver: yupResolver(upsertScraperJobSchema),
    defaultValues: {
      uuid: generateUUID(),
      name: '',
      execution: [],
    },
  })

  const isOpen = view === View.SCRAPER_JOB_CREATOR

  const onSubmit = useCallback((values: UpsertScraperJobSchema) => {
    console.info('submit:', values) //TODO: remove
  }, [])

  return (
    <div
      className={cn(
        'h-full flex flex-col items-stretch justify-start gap-4 py-4 duration-500',
        isOpen ? 'animate-in slide-in-from-bottom-64' : 'animate-out slide-out-to-bottom-64',
      )}
    >
      <ScrollArea className="px-4">
        <div className="flex flex-row items-center justify-between min-w-full">
          <span className="text-lg text-muted-foreground font-bold">
            Scraper job creator&nbsp;
            <TermInfo term="job" className="inline size-6 text-muted-foreground align-text-top" />
          </span>
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
      <div className="flex flex-col gap-4 xs:px-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, console.error)}
            className="flex flex-col gap-y-4 items-center"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hablabla" {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
