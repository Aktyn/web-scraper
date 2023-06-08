import {
  ErrorCode,
  wait,
  type ElectronToRendererMessage,
  type RendererToElectronResponseBlueprint,
  type ApiError,
  type ElectronApi,
  type IpcRendererEventPolyfill,
  type RendererToElectronMessage,
} from '@web-scraper/common'
import type { IpcMainInvokeEvent } from 'electron'
import isDev from 'electron-is-dev'
import * as uuid from 'uuid'

import { ExtendedBrowserWindow } from '../../extendedBrowserWindow'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiRequest = <ArgumentsType extends any[], ResponseType extends Promise<any>>(
  name: string,
  requestFunc: (...args: ArgumentsType) => ResponseType,
) =>
  (async (_: IpcMainInvokeEvent, ...args: ArgumentsType) => {
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

export function broadcastMessage<MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: ElectronApi[MessageType] extends (
    callback: (event: IpcRendererEventPolyfill, ...args: infer T) => void,
  ) => void
    ? T
    : never
) {
  ExtendedBrowserWindow.getInstances().forEach((windowInstance) => {
    windowInstance.sendMessage(message, ...(args as never))
  })
}

type MessageResponseData<MessageType extends ElectronToRendererMessage> = Extract<
  Parameters<
    Extract<
      ElectronApi[RendererToElectronMessage],
      RendererToElectronResponseBlueprint<MessageType, never[]>
    >
  >,
  Parameters<RendererToElectronResponseBlueprint<MessageType, unknown[]>>
> extends [unknown, unknown, ...infer T]
  ? T
  : never

const awaitingMessageResponses = new Map<
  string,
  <MessageType extends ElectronToRendererMessage>(
    originMessage: MessageType,
    data: MessageResponseData<MessageType>,
  ) => void
>()

export function broadcastMessageWithResponseRequest<MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: ElectronApi[MessageType] extends (
    callback: (event: IpcRendererEventPolyfill, requestId: string, ...args: infer T) => void,
  ) => void
    ? T
    : never
) {
  const requestId = uuid.v4()

  ExtendedBrowserWindow.getInstances().forEach((windowInstance) => {
    windowInstance.sendMessage(message, requestId, ...(args as never))
  })

  // awaitingResponses.set(requestId, new Set())
  return new Promise<MessageResponseData<MessageType>>((resolve, reject) => {
    const timeout = setTimeout(() => {
      awaitingMessageResponses.delete(requestId)
      reject(new Error(`Request ${requestId} for message ${message} timed out`))
    }, 1_800_000)

    awaitingMessageResponses.set(requestId, (originMessage, data) => {
      clearTimeout(timeout)
      resolve(data as never)
    })
  })
}

export async function responseToBroadcastedMessage<
  OriginMessageType extends ElectronToRendererMessage,
>(
  originMessage: OriginMessageType,
  requestId: string,
  ...data: MessageResponseData<OriginMessageType>
) {
  const awaitingMessageResponse = awaitingMessageResponses.get(requestId)
  if (!awaitingMessageResponse) {
    throw new Error(`No awaiting response for request id ${requestId}`)
  }

  awaitingMessageResponse(originMessage, data)
  awaitingMessageResponses.delete(requestId)
}
