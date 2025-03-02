import { X, Trash, Pencil, Play } from 'lucide-react'
import type { ScraperJob, UpsertScraperJobSchema } from '@web-scraper/common'
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { Config } from '~/config'
import { UrlButton } from '../common/button/url-button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Button } from '../ui/button'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { ExecutionFlow } from './execution-flow'
import { cn } from '~/lib/utils'
import { Fade } from '../common/fade'
import { ScraperJobForm } from './scraper-job-form'

type ScraperJobsListHandle = {
  collapseAll: () => void
  expandAll: () => void
}

type ScraperJobsListProps = {
  scraperJobs: ScraperJob[]
  onDelete: (id: ScraperJob['id']) => void
  deletingScraperJobId: ScraperJob['id'] | null
  onEdit: (id: ScraperJob['id'], data: UpsertScraperJobSchema) => void
  editingScraperJobId: ScraperJob['id'] | null
}

export const ScraperJobsList = memo(
  forwardRef<ScraperJobsListHandle, ScraperJobsListProps>(
    ({ scraperJobs, onDelete, deletingScraperJobId, onEdit, editingScraperJobId }, ref) => {
      const [openItems, setOpenItems] = useState<string[]>([])
      const [editingScraperJob, setEditingScraperJob] = useState<ScraperJob | null>(null)

      useEffect(() => {
        if (!editingScraperJob?.id) {
          return
        }
        setOpenItems((current) => {
          if (current.includes(editingScraperJob.id.toString())) {
            return current
          }
          return [...current, editingScraperJob.id.toString()]
        })
      }, [editingScraperJob?.id])

      useImperativeHandle(
        ref,
        () => ({
          collapseAll: () =>
            setOpenItems(editingScraperJob?.id ? [editingScraperJob.id.toString()] : []),
          expandAll: () => setOpenItems(scraperJobs.map((job) => job.id.toString())),
        }),
        [editingScraperJob?.id, scraperJobs],
      )

      return (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
          {scraperJobs.map((scraperJob, index) => {
            const isEditing = editingScraperJob?.id === scraperJob.id

            return (
              <AccordionItem
                key={scraperJob.id}
                value={scraperJob.id.toString()}
                className="bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-16 fill-mode-both duration-500"
                style={{ animationDelay: `${(index % Config.PAGINATION_PAGE_SIZE) * 100}ms` }}
              >
                <AccordionTrigger className="xs:px-4 gap-x-4 overflow-hidden hover:no-underline bg-background data-[state=open]:bg-card hover:bg-card transition-colors duration-200 cursor-pointer *:[svg]:size-5 items-center *:[svg]:translate-y-0">
                  <ScrollArea className="flex-1">
                    <div className="flex flex-row items-center relative">
                      <div
                        className={cn(
                          'flex flex-row items-baseline [&>span]:whitespace-nowrap [&>:is(span,a)]:py-2 opacity-100 transition-opacity duration-200 *:data-[slot=separator-root]:h-6 *:data-[slot=separator-root]:self-center *:data-[slot=separator-root]:mx-3',
                          isEditing && 'opacity-0 pointer-events-none',
                        )}
                      >
                        <span className="text-sm text-muted-foreground">Name:</span>&nbsp;
                        <span className="font-bold">{scraperJob.name}</span>
                        <Separator orientation="vertical" />
                        <span className="text-sm text-muted-foreground">Start URL:</span>&nbsp;
                        <UrlButton maxWidth="16rem">{scraperJob.startUrl}</UrlButton>
                        <Separator orientation="vertical" />
                        <span className="text-sm text-muted-foreground">Created:</span>&nbsp;
                        <span>
                          {scraperJob.createdAt.toLocaleString(undefined, { hour12: false })}
                        </span>
                      </div>
                      <Fade in={isEditing}>
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="absolute left-0 top-0 bottom-0"
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditingScraperJob(null)
                          }}
                        >
                          <span>
                            <X className="w-5 h-5" />
                            Exit edit mode
                          </span>
                        </Button>
                      </Fade>
                      <div className="ml-auto border-r px-4 flex flex-row items-center gap-x-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          data-loading={editingScraperJobId === scraperJob.id}
                          disabled={isEditing}
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditingScraperJob(scraperJob)
                          }}
                          className="[&[disabled]]:opacity-50 [&[disabled]]:pointer-events-none"
                        >
                          <span>
                            <Pencil className="w-5 h-5" />
                          </span>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          data-loading={deletingScraperJobId === scraperJob.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(scraperJob.id)
                          }}
                        >
                          <span>
                            <Trash className="w-5 h-5" />
                          </span>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          disabled={editingScraperJob?.id === scraperJob.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            //TODO: start new or reuse existing scraper instance to perform a scraper job with data source based on user input
                          }}
                          className="[&[disabled]]:opacity-50 [&[disabled]]:pointer-events-none"
                        >
                          <span>
                            <Play className="w-5 h-5" />
                          </span>
                        </Button>
                      </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </AccordionTrigger>
                <AccordionContent className="text-justify whitespace-pre-wrap xs:px-4">
                  {!isEditing ? (
                    <ExecutionFlow execution={scraperJob.execution} />
                  ) : (
                    <Fade in>
                      <ScraperJobForm
                        scraperJob={scraperJob}
                        onSubmit={(data) => {
                          onEdit(scraperJob.id, data)
                          setEditingScraperJob(null)
                        }}
                        creating={editingScraperJobId === scraperJob.id}
                      />
                    </Fade>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )
    },
  ),
)

ScraperJobsList.displayName = 'ScraperJobsList'
