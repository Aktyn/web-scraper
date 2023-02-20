import {
  type ApiError,
  type ElectronApi,
  type ElectronToRendererMessage,
  ErrorCode,
  RendererToElectronMessage,
} from '@web-scrapper/common'
import { ipcMain } from 'electron'

import { getAccounts } from './database/accounts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = <ArgumentsType extends any[], ResponseType extends Promise<any>>(
  requestFunc: (...args: ArgumentsType) => ResponseType,
) =>
  (async (...args: ArgumentsType) => {
    try {
      return await requestFunc(...args)
    } catch (error) {
      console.error(error)
      return { errorCode: ErrorCode.API_ERROR }
    }
  }) as unknown as (...args: ArgumentsType) => ResponseType | Promise<ApiError>

export function registerRequestsHandler() {
  const handler = {
    [RendererToElectronMessage.getAccounts]: handleApiError(() =>
      getAccounts().then((accounts) => ({ data: accounts })),
    ),
  } satisfies Omit<ElectronApi, ElectronToRendererMessage>

  for (const channel in handler) {
    ipcMain.handle(channel, handler[channel as RendererToElectronMessage])
  }
}
