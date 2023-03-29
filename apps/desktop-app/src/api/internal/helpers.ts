import {
  type ApiError,
  type ElectronApi,
  ErrorCode,
  type RendererToElectronMessage,
  wait,
} from '@web-scraper/common'
import type { IpcMainInvokeEvent } from 'electron'
import isDev from 'electron-is-dev'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiRequest = <ArgumentsType extends any[], ResponseType extends Promise<any>>(
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

export const successResponse: ApiError = {
  errorCode: ErrorCode.NO_ERROR,
}

export type RequestHandlersSchema = {
  [key in RendererToElectronMessage]: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<ElectronApi[key]>
  ) => ReturnType<ElectronApi[key]>
}
