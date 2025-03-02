import { ChevronLeft } from 'lucide-react'
import { type UpsertScraperJobSchema } from '@web-scraper/common'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { TermInfo } from '~/components/common/term-info'
import { ScraperJobForm } from '~/components/scraper-jobs/scraper-job-form'
import { Button } from '~/components/ui/button'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { useView } from '~/context/view-context'
import { useApiRequest } from '~/hooks/useApiRequest'
import { cn } from '~/lib/utils'
import { View } from '~/navigation'

export function ScraperJobCreator() {
  const { view, setView } = useView()

  const { submit: create, submitting } = useApiRequest(window.electronAPI.createScraperJob)

  const onSubmit = useCallback(
    (values: UpsertScraperJobSchema) => {
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
            <ChevronLeft />
            Return
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Separator />
      <div className="flex flex-col gap-4 py-4 xs:px-4">
        <ScraperJobForm onSubmit={onSubmit} creating={submitting} />
      </div>
    </ScrollArea>
  )
}
