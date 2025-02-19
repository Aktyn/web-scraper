import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, successResponse, type RequestHandlersSchema } from '../helpers'
import { parseDatabaseScraperJob } from '../parsers/scraperJob'

export const scraperJobHandler = {
  [RendererToElectronMessage.getScraperJobs]: handleApiRequest(
    RendererToElectronMessage.getScraperJobs,
    (request) =>
      Database.scraperJob.getScraperJobs(request).then((scraperJobs) => ({
        data: scraperJobs.map(parseDatabaseScraperJob),
        cursor: Database.utils.extractCursor(scraperJobs, 'id', request.count),
      })),
  ),
  [RendererToElectronMessage.createScraperJob]: handleApiRequest(
    RendererToElectronMessage.createScraperJob,
    (data) => Database.scraperJob.createScraperJob(data).then(parseDatabaseScraperJob),
  ),
  [RendererToElectronMessage.updateScraperJob]: handleApiRequest(
    RendererToElectronMessage.updateScraperJob,
    (id, data) => Database.scraperJob.updateScraperJob(id, data).then(parseDatabaseScraperJob),
  ),
  [RendererToElectronMessage.deleteScraperJob]: handleApiRequest(
    RendererToElectronMessage.deleteScraperJob,
    (id) => Database.scraperJob.deleteScraperJob(id).then(() => successResponse),
  ),
} satisfies Partial<RequestHandlersSchema>
