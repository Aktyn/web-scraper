import type { ScraperJob } from '@web-scraper/common'

type ScraperJobsListProps = {
  scraperJobs: ScraperJob[]
}

export function ScraperJobsList({ scraperJobs }: ScraperJobsListProps) {
  // TODO: Implement
  return (
    <div className="flex flex-col gap-4">
      {scraperJobs.map((scraperJob) => (
        <div key={scraperJob.id} className="bg-primary">
          {scraperJob.name}
        </div>
      ))}
    </div>
  )
}
