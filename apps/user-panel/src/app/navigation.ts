import type { FunctionComponent, LazyExoticComponent } from 'react'
import { lazy } from 'react'
import type { Theme } from '@mui/material'
import { mainThemes } from './themes'

type ViewComponentType = FunctionComponent<{ doNotRender?: boolean }>

export interface ViewSettingsSchema {
  disableTopFadeEffect?: boolean
  disableBottomFadeEffect?: boolean
}

interface NavigationEntry {
  component: LazyExoticComponent<ViewComponentType>
  theme?: Theme
  gridPosition: [number, number]
  viewSettings?: ViewSettingsSchema
}

const Navigation = {
  DASHBOARD: {
    component: lazy(() => import('./views/Dashboard/DashboardView')),
    theme: mainThemes.cyan,
    gridPosition: [0, 0],
  } as NavigationEntry,
  DATA_MANAGER: {
    component: lazy(() => import('./views/DataManager/DataManagerView')),
    theme: mainThemes.blue,
    gridPosition: [0, 1],
    viewSettings: {
      disableTopFadeEffect: true,
    },
  } as NavigationEntry,
  INFO: {
    component: lazy(() => import('./views/Info/InfoView')),
    theme: mainThemes.deepPurple,
    gridPosition: [1, 1],
    viewSettings: {
      disableTopFadeEffect: true,
    },
  } as NavigationEntry,
} as const

export default Navigation

/** Grid visualization of transition purposes **/
/*-------------------------------
| DASHBOARD     | ------------- |
| DATA_MANAGER  | INFO--------- |
--------------------------------*/
