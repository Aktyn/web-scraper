import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, successResponse, type RequestHandlersSchema } from '../helpers'
import { parseDatabaseSiteInstructions } from '../parsers/siteInstructionsParser'

export const siteInstructionsHandler = {
  [RendererToElectronMessage.getSiteInstructions]: handleApiRequest(
    RendererToElectronMessage.getSiteInstructions,
    (siteId) =>
      Database.siteInstructions.getSiteInstructions(siteId).then(parseDatabaseSiteInstructions),
  ),
  [RendererToElectronMessage.setSiteInstructions]: handleApiRequest(
    RendererToElectronMessage.setSiteInstructions,
    (siteId, data) =>
      Database.siteInstructions.setSiteInstructions(siteId, data).then(() => successResponse),
  ),
} satisfies Partial<RequestHandlersSchema>
