import { mdiDeveloperBoard } from '@mdi/js'
import Icon from '@mdi/react'
import { Spinner } from '~/components/common/spinner'
import { TermInfo } from '~/components/common/term-info'
import { ScraperJobsList } from '~/components/scraper-jobs/scraper-jobs-list'
import { Button } from '~/components/ui/button'
import { Fade } from '~/components/ui/fade'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { useView } from '~/context/view-context'
import { useScraperJobs } from '~/hooks/useScraperJobs'
import { View } from '~/navigation'

export function ScraperJobs() {
  const { setView } = useView()

  const { scraperJobs, loading } = useScraperJobs()

  return (
    <div className="h-full flex flex-col items-stretch justify-start">
      <ScrollArea className="p-4">
        <div className="flex flex-row items-center justify-between min-w-full gap-x-4">
          <TermInfo term="job" className="size-6 text-muted-foreground" />
          <Button
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
      <div className="xs:px-4 py-4">
        <Fade
          in={loading}
          inClassName="animate-in slide-in-from-bottom-2"
          outClassName="animate-out slide-out-to-bottom-2"
        >
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        </Fade>
        <ScraperJobsList scraperJobs={scraperJobs} />
      </div>
    </div>
  )
}
