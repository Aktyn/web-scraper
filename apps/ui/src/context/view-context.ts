import { createContext } from 'react'

// export enum ViewTransitionState {
//   IDLE = 'idle',
//   ENTERING = 'entering',
//   LEAVING = 'leaving',
// }

// export type ViewName = keyof typeof Navigation

export const ViewContext = createContext({
  // viewName: 'DASHBOARD' as ViewName,
  // previousViewName: null as ViewName | null,
  // nextViewName: null as ViewName | null,
  // viewTransitionState: ViewTransitionState.IDLE,
  // requestViewChange: noop as (viewName: ViewName) => void,
  // viewSettings: undefined as ViewSettingsSchema | undefined,
  maximized: false,
})
