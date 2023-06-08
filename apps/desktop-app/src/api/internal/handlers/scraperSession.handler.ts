import {
  ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scraper/common'

import Database from '../../../database'
import { Scraper } from '../../../scraper'
import type { RequestDataCallback } from '../../../scraper/steps'
import {
  broadcastMessage,
  handleApiRequest,
  successResponse,
  type RequestHandlersSchema,
  broadcastMessageWithResponseRequest,
  responseToBroadcastedMessage,
} from '../helpers'
import { parseDatabaseSite } from '../parsers/siteParser'

export const scraperSessionHandler = {
  [RendererToElectronMessage.getSiteInstructionsTestingSessions]: handleApiRequest(
    RendererToElectronMessage.getSiteInstructionsTestingSessions,
    () => {
      return Promise.all(
        Array.from(Scraper.getInstances(Scraper.Mode.TESTING).values()).map(async (scraper) => ({
          sessionId: scraper.id,
          site: await Database.site.getSite(scraper.getOptions().siteId).then(parseDatabaseSite),
        })),
      )
    },
  ),
  [RendererToElectronMessage.startSiteInstructionsTestingSession]: handleApiRequest(
    RendererToElectronMessage.startSiteInstructionsTestingSession,
    (siteId) =>
      Database.site.getSite(siteId).then((site) => {
        const existingInstance = Array.from(
          Scraper.getInstances(Scraper.Mode.TESTING).values(),
        ).find((instance) => instance.getOptions().lockURL === site.url)

        if (existingInstance) {
          console.warn(
            'Site instructions testing session already started with id:',
            existingInstance.id,
          )
          return { sessionId: existingInstance.id }
        }

        const testingModeScraperInstance = new Scraper(Scraper.Mode.TESTING, {
          siteId: site.id,
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
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }
      await scraper.destroy()

      broadcastMessage(ElectronToRendererMessage.siteInstructionsTestingSessionClosed, scraper.id)

      return successResponse
    },
  ),
  [RendererToElectronMessage.testActionStep]: handleApiRequest(
    RendererToElectronMessage.testActionStep,
    (sessionId, actionStep) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      const onDataRequest: RequestDataCallback = async (valueQuery) => {
        const [value] = await broadcastMessageWithResponseRequest(
          ElectronToRendererMessage.requestManualDataForActionStep,
          actionStep,
          valueQuery,
        )
        return value
      }

      return scraper.performActionStep(actionStep, onDataRequest)
    },
  ),
  [RendererToElectronMessage.returnManualDataForActionStep]: handleApiRequest(
    RendererToElectronMessage.returnManualDataForActionStep,
    async (originMessage, requestId, value) => {
      await responseToBroadcastedMessage(originMessage, requestId, value)
      return successResponse
    },
  ),
} satisfies Partial<RequestHandlersSchema>
