import {
  dataSourceQueryRegex,
  ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
  ValueQueryType,
} from '@web-scraper/common'

import Database from '../../../database'
import {
  type RequestDataCallback,
  type RequestDataSourceItemIdCallback,
  Scraper,
} from '../../../scraper'
import {
  broadcastMessage,
  broadcastMessageWithResponseRequest,
  handleApiRequest,
  type RequestHandlersSchema,
  responseToBroadcastedMessage,
  successResponse,
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
  [RendererToElectronMessage.testActionStep]: handleApiRequest(
    RendererToElectronMessage.testActionStep,
    (sessionId, actionStep) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performActionStep(actionStep, onDataRequest, onDataSourceItemIdRequest)
    },
  ),
  [RendererToElectronMessage.testAction]: handleApiRequest(
    RendererToElectronMessage.testAction,
    (sessionId, action) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performAction(action, onDataRequest, onDataSourceItemIdRequest)
    },
  ),
  [RendererToElectronMessage.testFlow]: handleApiRequest(
    RendererToElectronMessage.testFlow,
    (sessionId, flow, actions) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performFlow(flow, actions, onDataRequest, onDataSourceItemIdRequest)
    },
  ),
  [RendererToElectronMessage.testProcedure]: handleApiRequest(
    RendererToElectronMessage.testProcedure,
    (sessionId, procedure, actions) => {
      const scraper = Scraper.getInstances(Scraper.Mode.TESTING).get(sessionId)
      if (!scraper) {
        throw ErrorCode.NOT_FOUND
      }

      return scraper.performProcedure(procedure, actions, onDataRequest, onDataSourceItemIdRequest)
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

const onDataRequest: RequestDataCallback = async (valueQuery, actionStep) => {
  if (valueQuery.startsWith(ValueQueryType.CUSTOM + '.')) {
    return valueQuery.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), '')
  }

  const [value] = await broadcastMessageWithResponseRequest(
    ElectronToRendererMessage.requestManualDataForActionStep,
    actionStep,
    valueQuery,
  )
  return value
}

const onDataSourceItemIdRequest: RequestDataSourceItemIdCallback = async (
  dataSourceValueQuery,
  actionStep,
) => {
  if (!dataSourceValueQuery.match(dataSourceQueryRegex)) {
    return null
  }

  const [value] = await broadcastMessageWithResponseRequest(
    ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
    actionStep,
    dataSourceValueQuery,
  )
  return value
}
