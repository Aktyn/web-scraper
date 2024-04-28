import {
  ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scraper/common'

import Database from '../../../database'
import { Scraper } from '../../../scraper'
import {
  broadcastMessage,
  handleApiRequest,
  responseToBroadcastedMessage,
  successResponse,
  type RequestHandlersSchema,
} from '../helpers'
import { parseDatabaseSite } from '../parsers/siteParser'

import { onManualDataRequest, onManualDataSourceItemIdRequest } from './helpers'

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
      Database.site.getSite(siteId).then(async (site) => {
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
        await testingModeScraperInstance.waitForInit()

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
  [RendererToElectronMessage.pickElement]: handleApiRequest(
    RendererToElectronMessage.pickElement,
    (sessionId, pickFromUrl) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.pickElement(pickFromUrl)
    },
  ),
  [RendererToElectronMessage.cancelPickingElement]: handleApiRequest(
    RendererToElectronMessage.cancelPickingElement,
    async (sessionId) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      await scraper.cancelPickingElement()
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

      return scraper.performActionStep(
        actionStep,
        onManualDataRequest,
        onManualDataSourceItemIdRequest,
      )
    },
  ),
  [RendererToElectronMessage.testAction]: handleApiRequest(
    RendererToElectronMessage.testAction,
    (sessionId, action) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performAction(
        action,
        scraper.getOptions().lockURL,
        onManualDataRequest,
        onManualDataSourceItemIdRequest,
      )
    },
  ),
  [RendererToElectronMessage.testFlow]: handleApiRequest(
    RendererToElectronMessage.testFlow,
    (sessionId, flow, actions) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performFlow(
        flow,
        actions,
        scraper.getOptions().lockURL,
        onManualDataRequest,
        onManualDataSourceItemIdRequest,
      )
    },
  ),
  [RendererToElectronMessage.testProcedure]: handleApiRequest(
    RendererToElectronMessage.testProcedure,
    (sessionId, procedure, actions) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performProcedure(
        scraper.getOptions().lockURL,
        procedure,
        actions,
        onManualDataRequest,
        onManualDataSourceItemIdRequest,
      )
    },
  ),
  [RendererToElectronMessage.returnManualDataForActionStep]: handleApiRequest(
    RendererToElectronMessage.returnManualDataForActionStep,
    async (originMessage, requestId, value) => {
      await responseToBroadcastedMessage(originMessage, requestId, value)
      return successResponse
    },
  ),
  [RendererToElectronMessage.returnDataSourceItemIdForActionStep]: handleApiRequest(
    RendererToElectronMessage.returnDataSourceItemIdForActionStep,
    async (originMessage, requestId, itemId) => {
      await responseToBroadcastedMessage(originMessage, requestId, itemId)
      return successResponse
    },
  ),
} satisfies Partial<RequestHandlersSchema>
