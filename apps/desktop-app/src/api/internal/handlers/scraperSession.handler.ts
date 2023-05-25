import { ElectronToRendererMessage, RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { ExtendedBrowserWindow } from '../../../extendedBrowserWindow'
import { Scraper } from '../../../scraper'
import { handleApiRequest, type RequestHandlersSchema } from '../helpers'

export const scraperSessionHandler = {
  [RendererToElectronMessage.startSiteInstructionsTestingSession]: handleApiRequest(
    RendererToElectronMessage.startSiteInstructionsTestingSession,
    (siteId) =>
      Database.site.getSite(siteId).then((site) => {
        const existingInstance = Array.from(
          Scraper.getInstances(Scraper.Mode.TESTING).values(),
        ).find((instance) => instance.getTestingURL() === site.url)

        if (existingInstance) {
          console.warn(
            'Site instructions testing session already started with id:',
            existingInstance.id,
          )
          return { sessionId: existingInstance.id }
        }

        const testingModeScraperInstance = new Scraper(Scraper.Mode.TESTING, {
          lockURL: site.url,
          onClose: () => {
            ExtendedBrowserWindow.getInstances().forEach((windowInstance) => {
              windowInstance.sendMessage(
                ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
                testingModeScraperInstance.id,
              )
            })
          },
        })

        return { sessionId: testingModeScraperInstance.id }
      }),
  ),
} satisfies Partial<RequestHandlersSchema>
