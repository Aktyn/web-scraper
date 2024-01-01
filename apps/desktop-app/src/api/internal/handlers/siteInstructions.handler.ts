import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, successResponse, type RequestHandlersSchema } from '../helpers'
import {
  parseDatabaseProcedure,
  parseDatabaseSiteInstructions,
} from '../parsers/siteInstructionsParser'
import { parseDatabaseSite } from '../parsers/siteParser'

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
  [RendererToElectronMessage.getProceduresGroupedBySite]: handleApiRequest(
    RendererToElectronMessage.getProceduresGroupedBySite,
    () =>
      Database.siteInstructions.getProceduresGroupedBySite().then((data) =>
        data.map((item) => ({
          site: parseDatabaseSite(item.Site),
          procedures: item.Procedures.map(parseDatabaseProcedure),
        })),
      ),
  ),
} satisfies Partial<RequestHandlersSchema>
