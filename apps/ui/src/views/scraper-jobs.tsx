import { mdiDeveloperBoard } from '@mdi/js'
import Icon from '@mdi/react'
import { TermInfo } from '~/components/common/term-info'
import { ScraperJobsList } from '~/components/scraper-jobs/scraper-jobs-list'
import { Button } from '~/components/ui/button'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { useView } from '~/context/view-context'
import { View } from '~/navigation'

export function ScraperJobs() {
  const { setView } = useView()

  return (
    <div className="h-full flex flex-col items-stretch justify-start gap-4 py-4">
      <ScrollArea className="px-4">
        <div className="flex flex-row items-center justify-between min-w-full">
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
      <ScraperJobsList />
    </div>
  )
}
