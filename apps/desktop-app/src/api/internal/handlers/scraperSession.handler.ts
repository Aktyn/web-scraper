import type { ElectronApi } from '@web-scraper/common'
import {
  ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scraper/common'

import Database from '../../../database'
import { ExtendedBrowserWindow } from '../../../extendedBrowserWindow'
import { Scraper } from '../../../scraper'
import { handleApiRequest, successResponse, type RequestHandlersSchema } from '../helpers'
import { parseDatabaseSite } from '../parsers/siteParser'

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
            broadcastMessage(
              ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
              testingModeScraperInstance.id,
            )
          },
        })

        broadcastMessage(
          ElectronToRendererMessage.siteInstructionsTestingSessionOpen,
          testingModeScraperInstance.id,
          parseDatabaseSite(site),
        )

        return { sessionId: testingModeScraperInstance.id }
      }),
  ),
  [RendererToElectronMessage.endSiteInstructionsTestingSession]: handleApiRequest(
    RendererToElectronMessage.endSiteInstructionsTestingSession,
    async (sessionId) => {
      const existingInstance = Array.from(Scraper.getInstances(Scraper.Mode.TESTING).values()).find(
        (instance) => instance.id === sessionId,
      )
      if (!existingInstance) {
        throw ErrorCode.NOT_FOUND
      }
      await existingInstance.destroy()

      broadcastMessage(
        ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
        existingInstance.id,
      )

      return successResponse
    },
  ),
} satisfies Partial<RequestHandlersSchema>

function broadcastMessage<MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: ElectronApi[MessageType] extends (
    callback: (event: Event, ...args: infer T) => void,
  ) => void
    ? T
    : never
) {
  ExtendedBrowserWindow.getInstances().forEach((windowInstance) => {
    windowInstance.sendMessage(message, ...args)
  })
}
