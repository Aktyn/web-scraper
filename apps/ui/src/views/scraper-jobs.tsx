import { mdiDeveloperBoard, mdiPageNext } from '@mdi/js'
import Icon from '@mdi/react'
import { Spinner } from '~/components/common/spinner'
import { TermInfo } from '~/components/common/term-info'
import { ScraperJobsList } from '~/components/scraper-jobs/scraper-jobs-list'
import { Button } from '~/components/ui/button'
import { Fade } from '~/components/ui/fade'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useView } from '~/context/view-context'
import { useScraperJobs } from '~/hooks/useScraperJobs'
import { cn } from '~/lib/utils'
import { View } from '~/navigation'

export function ScraperJobs() {
  const { setView } = useView()

  const { scraperJobs, loadMore, loading, hasMore, deleteScraperJob, deleting } = useScraperJobs()

  return (
    <div className="h-full flex flex-col items-stretch justify-start">
      <ScrollArea className="p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-between min-w-full gap-x-4">
          <div className="flex items-center gap-x-2">
            <TermInfo term="job" className="size-6 text-muted-foreground" />
            <Tooltip>
              <Fade in={!loading || scraperJobs.length > 0}>
                <TooltipTrigger asChild>
                  <div className={cn('flex justify-center', !loading && !hasMore && 'font-bold')}>
                    ({scraperJobs.length})
                  </div>
                </TooltipTrigger>
              </Fade>
              <TooltipContent side="right">
                Loaded <b>{scraperJobs.length}</b> scraper jobs{!loading && !hasMore && ' (all)'}
              </TooltipContent>
            </Tooltip>
          </div>
          <Fade in={loading}>
            <div className="flex justify-center">
              <Spinner />
            </div>
          </Fade>
          <Button
            className="ml-auto col-start-3"
            variant="secondary"
            onClick={() => {
              setView(View.SCRAPER_JOB_CREATOR)
            }}
          >
            <Icon path={mdiDeveloperBoard} />
            Open scraper job creator
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Separator />
      <ScrollArea className="flex-1">
        <Fade in={!loading && !scraperJobs.length}>
          <div className="flex justify-center py-4 text-lg font-bold text-muted-foreground">
            No scraper jobs found
          </div>
        </Fade>
        <ScraperJobsList
          scraperJobs={scraperJobs}
          onDelete={deleteScraperJob}
          deleting={deleting}
        />
        <Fade in={hasMore && scraperJobs.length > 0} delay={scraperJobs.length * 100}>
          <div className="flex justify-center py-4">
            <Button variant="secondary" onClick={loadMore}>
              <Icon path={mdiPageNext} />
              Load more
            </Button>
          </div>
        </Fade>
      </ScrollArea>
    </div>
  )
}
