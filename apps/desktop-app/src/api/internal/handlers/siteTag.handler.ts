import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseDatabaseSiteTag } from '../parsers/siteParser'

export const siteTagHandler = {
  [RendererToElectronMessage.getSiteTags]: handleApiRequest(
    RendererToElectronMessage.getSiteTags,
    (request) =>
      Database.siteTag.getSiteTags(request).then((tags) => ({
        data: tags.map(parseDatabaseSiteTag),
        cursor: Database.utils.extractCursor(tags, 'id', request.count),
      })),
  ),
  [RendererToElectronMessage.deleteSiteTag]: handleApiRequest(
    RendererToElectronMessage.deleteSiteTag,
    (id) => Database.siteTag.deleteSiteTag(id).then(() => successResponse),
  ),
  [RendererToElectronMessage.updateSiteTag]: handleApiRequest(
    RendererToElectronMessage.updateSiteTag,
    (id, data) => Database.siteTag.updateSiteTag(id, data).then(parseDatabaseSiteTag),
  ),
  [RendererToElectronMessage.createSiteTag]: handleApiRequest(
    RendererToElectronMessage.createSiteTag,
    (data) => Database.siteTag.createSiteTag(data).then(parseDatabaseSiteTag),
  ),
  [RendererToElectronMessage.deleteLooseSiteTags]: handleApiRequest(
    RendererToElectronMessage.deleteLooseSiteTags,
    () => Database.siteTag.deleteLooseSiteTags().then((res) => ({ deletedCount: res.count })),
  ),
} satisfies Partial<RequestHandlersSchema>
