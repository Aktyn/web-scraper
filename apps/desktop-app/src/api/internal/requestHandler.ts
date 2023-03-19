import {
  type ApiError,
  type ElectronApi,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scrapper/common'
import { ipcMain, type IpcMainInvokeEvent } from 'electron'

import Database from '../../database'
import { getPagePreview } from '../../utils/puppeeterMisc'

import { parseDatabaseAccount } from './parsers/accountParser'
import { parseDatabaseSite } from './parsers/siteParser'
import { parseUserSettings } from './parsers/userSettingsParser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiRequest = <ArgumentsType extends any[], ResponseType extends Promise<any>>(
  name: string,
  requestFunc: (...args: ArgumentsType) => ResponseType,
) =>
  (async (event: IpcMainInvokeEvent, ...args: ArgumentsType) => {
    // eslint-disable-next-line no-console
    console.log(`[API request] [name: ${name}] [args: ${JSON.stringify(args)}]`)
    try {
      //TODO: delay response in dev environment to simulate network latency
      return await requestFunc(...args)
    } catch (error) {
      console.error('Request function error:', error)
      if (typeof error === 'number') {
        return { errorCode: error as ErrorCode }
      }
      return {
        errorCode: ErrorCode.API_ERROR,
        error: error instanceof Error || typeof error === 'string' ? error : null,
      }
    }
  }) as unknown as (
    event: IpcMainInvokeEvent,
    ...args: ArgumentsType
  ) => ResponseType | Promise<ApiError>

const successResponse: ApiError = {
  errorCode: ErrorCode.NO_ERROR,
}

export function registerRequestsHandler() {
  const handler = {
    [RendererToElectronMessage.getUserSettings]: handleApiRequest(
      RendererToElectronMessage.getUserSettings,
      () => Database.userData.getUserSettings().then(parseUserSettings),
    ),
    [RendererToElectronMessage.setUserSetting]: handleApiRequest(
      RendererToElectronMessage.setUserSetting,
      (key, value) => Database.userData.setUserSetting(key, value).then(() => successResponse),
    ),
    [RendererToElectronMessage.getAccounts]: handleApiRequest(
      RendererToElectronMessage.getAccounts,
      (request, password) =>
        Database.account.getAccounts(request).then((accounts) => ({
          data: accounts.map((account) => parseDatabaseAccount(account, password)),
          cursor: Database.utils.extractCursor(accounts, 'id', request.count),
        })),
    ),
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
  } satisfies {
    [key in RendererToElectronMessage]: (
      event: IpcMainInvokeEvent,
      ...args: Parameters<ElectronApi[key]>
    ) => ReturnType<ElectronApi[key]>
  }

  for (const channel in handler) {
    ipcMain.handle(channel, handler[channel as never])
  }
}
