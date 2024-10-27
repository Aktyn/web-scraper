import { mdiDelete, mdiPencil, mdiPlay } from '@mdi/js'
import Icon from '@mdi/react'
import type { ScraperJob } from '@web-scraper/common'
import { UrlButton } from '../common/button/url-button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Button } from '../ui/button'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { ExecutionFlow } from './execution-flow'
import { Config } from '~/config'

type ScraperJobsListProps = {
  scraperJobs: ScraperJob[]
  onDelete: (id: ScraperJob['id']) => void
  deleting: boolean
}

export function ScraperJobsList({ scraperJobs, onDelete, deleting }: ScraperJobsListProps) {
  return (
    <Accordion type="multiple">
      {scraperJobs.map((scraperJob, index) => (
        <AccordionItem
          key={scraperJob.id}
          value={scraperJob.id.toString()}
          className="bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-16 fill-mode-both duration-500"
          style={{ animationDelay: `${(index % Config.PAGINATION_PAGE_SIZE) * 100}ms` }}
        >
          <AccordionTrigger className="xs:px-4 gap-x-4 overflow-hidden hover:no-underline bg-background [&[data-state=open]]:bg-card hover:bg-card transition-colors duration-200">
            <ScrollArea className="flex-1">
              <div className="flex flex-row items-baseline [&>span]:whitespace-nowrap [&>:is(span,a)]:py-2">
                <span className="text-sm text-muted-foreground">Name:</span>&nbsp;
                <span className="font-bold">{scraperJob.name}</span>
                <Separator orientation="vertical" className="self-stretch h-auto mx-3" />
                <span className="text-sm text-muted-foreground">Start URL:</span>&nbsp;
                <UrlButton maxWidth="12rem">{scraperJob.startUrl}</UrlButton>
                <Separator orientation="vertical" className="self-stretch h-auto mx-3" />
                <span className="text-sm text-muted-foreground">Created:</span>&nbsp;
                <span>{scraperJob.createdAt.toLocaleString(undefined, { hour12: false })}</span>
                <div className="ml-auto border-r px-4 flex flex-row items-center  gap-x-1">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    <span>
                      <Icon path={mdiPencil} />
                    </span>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(scraperJob.id)
                    }}
                    loading={deleting}
                  >
                    <span>
                      <Icon path={mdiDelete} />
                    </span>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    <span>
                      <Icon path={mdiPlay} className="size-5" />
                    </span>
                  </Button>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </AccordionTrigger>
          <AccordionContent className="text-justify whitespace-pre-wrap xs:px-4">
            <ExecutionFlow execution={scraperJob.execution} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
