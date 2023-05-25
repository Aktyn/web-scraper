import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { getPagePreview } from '../../../utils/scraperMisc'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseDatabaseSite } from '../parsers/siteParser'

export const siteHandler = {
  [RendererToElectronMessage.getSites]: handleApiRequest(
    RendererToElectronMessage.getSites,
    (request) =>
      Database.site.getSites(request).then((sites) => ({
        data: sites.map(parseDatabaseSite),
        cursor: Database.utils.extractCursor(sites, 'id', request.count),
      })),
  ),
  [RendererToElectronMessage.getSite]: handleApiRequest(RendererToElectronMessage.getSite, (id) =>
    Database.site.getSite(id).then(parseDatabaseSite),
  ),
  [RendererToElectronMessage.createSite]: handleApiRequest(
    RendererToElectronMessage.createSite,
    (data) => Database.site.createSite(data).then(parseDatabaseSite),
  ),
  [RendererToElectronMessage.deleteSite]: handleApiRequest(
    RendererToElectronMessage.deleteSite,
    (id) => Database.site.deleteSite(id).then(() => successResponse),
  ),
  [RendererToElectronMessage.updateSite]: handleApiRequest(
    RendererToElectronMessage.updateSite,
    (id, data) => Database.site.updateSite(id, data).then(parseDatabaseSite),
  ),
  [RendererToElectronMessage.getSitePreview]: handleApiRequest(
    RendererToElectronMessage.getSitePreview,
    (url) => getPagePreview(url).then((preview) => ({ imageBase64: preview })),
  ),
} satisfies Partial<RequestHandlersSchema>
