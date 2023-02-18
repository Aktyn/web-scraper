import { createContext } from 'react'
import type Navigation from '../navigation'
import type { ViewSettingsSchema } from '../navigation'

export enum ViewTransitionState {
  IDLE = 'idle',
  ENTERING = 'entering',
  LEAVING = 'leaving',
}

export type ViewName = keyof typeof Navigation

const noop = () => {
  // do nothing
}

export const ViewContext = createContext({
  viewName: 'DASHBOARD' as ViewName,
  previousViewName: null as ViewName | null,
  nextViewName: null as ViewName | null,
  viewTransitionState: ViewTransitionState.IDLE,
  requestViewChange: noop as (viewName: ViewName) => void,
  viewSettings: undefined as ViewSettingsSchema | undefined,
})
