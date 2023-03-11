import {
  type ApiError,
  type ElectronApi,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scrapper/common'
import { ipcMain, type IpcMainInvokeEvent } from 'electron'

import Database from '../../database'

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
      console.error(error)
      return { errorCode: typeof error === 'number' ? (error as ErrorCode) : ErrorCode.API_ERROR }
    }
  }) as unknown as (
    event: IpcMainInvokeEvent,
    ...args: ArgumentsType
  ) => ResponseType | Promise<ApiError>

export function registerRequestsHandler() {
  const handler = {
    [RendererToElectronMessage.getUserSettings]: handleApiRequest(
      RendererToElectronMessage.getUserSettings,
      () => Database.userData.getUserSettings().then(parseUserSettings),
    ),
    [RendererToElectronMessage.setUserSetting]: handleApiRequest(
      RendererToElectronMessage.setUserSetting,
      (key, value) =>
        Database.userData.setUserSetting(key, value).then(() => ({
          errorCode: ErrorCode.NO_ERROR,
        })),
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
