import {
  type ApiError,
  type ElectronApi,
  ErrorCode,
  RendererToElectronMessage,
  wait,
} from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import isDev from 'electron-is-dev'

import Database from '../../database'
import { getPagePreview } from '../../utils/puppeeterMisc'

import { parseDatabaseAccount } from './parsers/accountParser'
import { parseDatabaseSite, parseDatabaseSiteTag } from './parsers/siteParser'
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
      if (isDev) {
        await wait(400)
      }
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
