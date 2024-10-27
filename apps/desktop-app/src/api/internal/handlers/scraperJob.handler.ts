import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema } from '../helpers'
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
  // [RendererToElectronMessage.getSite]: handleApiRequest(RendererToElectronMessage.getSite, (id) =>
  //   Database.site.getSite(id).then(parseDatabaseSite),
  // ),
  [RendererToElectronMessage.createScraperJob]: handleApiRequest(
    RendererToElectronMessage.createScraperJob,
    (data) => Database.scraperJob.createScraperJob(data).then(parseDatabaseScraperJob),
  ),
  // [RendererToElectronMessage.deleteSite]: handleApiRequest(
  //   RendererToElectronMessage.deleteSite,
  //   (id) => Database.site.deleteSite(id).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.updateSite]: handleApiRequest(
  //   RendererToElectronMessage.updateSite,
  //   (id, data) => Database.site.updateSite(id, data).then(parseDatabaseSite),
  // ),
} satisfies Partial<RequestHandlersSchema>
