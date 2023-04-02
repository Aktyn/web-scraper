import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema } from '../helpers'
import { parseDatabaseSiteInstructions } from '../parsers/siteInstructionsParser'

export const siteInstructionsHandler = {
  [RendererToElectronMessage.getSiteInstructions]: handleApiRequest(
    RendererToElectronMessage.getSiteInstructions,
    (siteId) =>
      Database.siteInstructions.getSiteInstructions(siteId).then(parseDatabaseSiteInstructions),
  ),
} satisfies Partial<RequestHandlersSchema>
