import { createContext } from 'react'
import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
import { noop } from '../utils'

export type EventListenerType = <MessageType extends ElectronToRendererMessage>(
  message: MessageType,
  ...args: Parameters<Parameters<ElectronApi[MessageType]>[0]>
) => void

export const ApiEventsContext = createContext({
  addEventsListener: noop as (listener: EventListenerType) => void,
  removeEventsListener: noop as (listener: EventListenerType) => void,
})
