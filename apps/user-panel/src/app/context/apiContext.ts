import { createContext } from 'react'
import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
import type { TestingSessionsContext } from '../api/ApiProvider'
import { noop } from '../utils'

export type ApiEventListenerType = <MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: Parameters<Parameters<ElectronApi[MessageType]>[0]>
) => void

export const ApiContext = createContext({
  addEventsListener: noop as (listener: ApiEventListenerType) => void,
  removeEventsListener: noop as (listener: ApiEventListenerType) => void,

  testingSessions: {} as TestingSessionsContext,
})
