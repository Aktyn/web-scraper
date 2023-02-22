import {
  type ApiError,
  type ElectronApi,
  type ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scrapper/common'
import { ipcMain } from 'electron'

import Database from './database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiRequest = <ArgumentsType extends any[], ResponseType extends Promise<any>>(
  name: string,
  requestFunc: (...args: ArgumentsType) => ResponseType,
) =>
  (async (...args: ArgumentsType) => {
    // eslint-disable-next-line no-console
    console.log(`[API request][name: ${name}]`)
    try {
      //TODO: delay response in dev environment to simulate network latency
      return await requestFunc(...args)
    } catch (error) {
      console.error(error)
      return { errorCode: typeof error === 'number' ? (error as ErrorCode) : ErrorCode.API_ERROR }
    }
  }) as unknown as (...args: ArgumentsType) => ResponseType | Promise<ApiError>

export function registerRequestsHandler() {
  const handler = {
    [RendererToElectronMessage.getAccounts]: handleApiRequest('getAccounts', (request) =>
      Database.account.getAccounts(request).then((accounts) => ({
        data: accounts,
        cursor: Database.utils.extractCursor(accounts, 'id'),
      })),
    ),
  } satisfies Omit<ElectronApi, ElectronToRendererMessage>

  for (const channel in handler) {
    ipcMain.handle(channel, handler[channel as never])
  }
}
