import { pick, type ScraperJob } from '@web-scraper/common'
import type { createScraperJob } from '../../../database/scraperJob'

export function parseDatabaseScraperJob(
  scraperJobData: Awaited<ReturnType<typeof createScraperJob>>,
): ScraperJob {
  return {
    ...pick(scraperJobData, 'id', 'createdAt', 'name', 'startUrl'),
    execution: JSON.parse(scraperJobData.execution),
  }
}
