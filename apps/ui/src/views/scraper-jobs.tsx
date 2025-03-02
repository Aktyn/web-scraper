import { mdiCollapseAll, mdiDeveloperBoard, mdiExpandAll, mdiPageNext, mdiReload } from '@mdi/js'
import Icon from '@mdi/react'
import { useRef } from 'react'
import { Spinner } from '~/components/common/spinner'
import { TermInfo } from '~/components/common/term-info'
import { ScraperJobsList } from '~/components/scraper-jobs/scraper-jobs-list'
import { Button } from '~/components/ui/button'
import { Fade } from '~/components/common/fade'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useView } from '~/context/view-context'
import { useScraperJobs } from '~/hooks/useScraperJobs'
import type { ForwardedReferenceType } from '~/lib/type-helpers'
import { cn } from '~/lib/utils'
import { View } from '~/navigation'

export function ScraperJobs() {
  const { setView } = useView()
  const scraperJobsListRef = useRef<ForwardedReferenceType<typeof ScraperJobsList>>(null)

  const {
    scraperJobs,
    loadMore,
    loading,
    hasMore,
    deleteScraperJob,
    deleting,
    editScraperJob,
    editing,
  } = useScraperJobs()

  return (
    <div className="h-full flex flex-col items-stretch justify-start">
      <ScrollArea className="p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-between min-w-full gap-x-4">
          <div className="flex items-center gap-x-2">
            <TermInfo term="job" className="size-6 text-muted-foreground" />
            <Tooltip>
              <Fade in={scraperJobs.length > 0 ? !loading : false}>
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
          <div className="ml-auto col-start-3 inline-flex flex-row items-center gap-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loading}
                  onClick={() => loadMore(true)}
                >
                  <Icon path={mdiReload} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reload</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scraperJobsListRef.current?.expandAll()}
                >
                  <Icon path={mdiExpandAll} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Expand all</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scraperJobsListRef.current?.collapseAll()}
                >
                  <Icon path={mdiCollapseAll} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Collapse all</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-auto self-stretch" />
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
          ref={scraperJobsListRef}
          scraperJobs={scraperJobs}
          onDelete={deleteScraperJob}
          deletingScraperJobId={deleting}
          onEdit={editScraperJob}
          editingScraperJobId={editing}
        />
        <Fade in={hasMore && scraperJobs.length > 0} delay={scraperJobs.length * 100}>
          <div className="flex justify-center py-4">
            <Button variant="secondary" onClick={() => loadMore()}>
              <Icon path={mdiPageNext} />
              Load more
            </Button>
          </div>
        </Fade>
      </ScrollArea>
    </div>
  )
}
