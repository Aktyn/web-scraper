import { lazy, type FunctionComponent, type LazyExoticComponent } from 'react'
import type { Theme } from '@mui/material'
import { mainThemes } from './themes'

type ViewComponentType = FunctionComponent<{ doNotRender?: boolean }>

export interface ViewSettingsSchema {
  disableTopFadeEffect?: boolean
  disableBottomFadeEffect?: boolean
}

interface NavigationEntry {
  component: LazyExoticComponent<ViewComponentType>
  theme: Theme
  gridPosition: [number, number]
  viewSettings?: ViewSettingsSchema
}

export const Navigation = {
  DASHBOARD: {
    component: lazy(() => import('./views/Dashboard/DashboardView')),
    theme: mainThemes.deepPurple,
    gridPosition: [0, 0],
  } as NavigationEntry,
  ROUTINES: {
    component: lazy(() => import('./views/Routines/RoutinesView')),
    theme: mainThemes.indigo,
    gridPosition: [1, 0],
  } as NavigationEntry,
  DATA_MANAGER: {
    component: lazy(() => import('./views/DataManager/DataManagerView')),
    theme: mainThemes.blue,
    gridPosition: [2, 0],
    viewSettings: {
      disableTopFadeEffect: true,
    },
  } as NavigationEntry,
  TESTING: {
    component: lazy(() => import('./views/Testing/TestingView')),
    theme: mainThemes.cyan,
    gridPosition: [0, 1],
  } as NavigationEntry,
  CAPTCHA: {
    component: lazy(() => import('./views/Captcha/CaptchaView')),
    theme: mainThemes.purple,
    gridPosition: [1, 1],
  } as NavigationEntry,
  INFO: {
    component: lazy(() => import('./views/Info/InfoView')),
    theme: mainThemes.pink,
    gridPosition: [2, 1],
    viewSettings: {
      disableTopFadeEffect: true,
    },
  } as NavigationEntry,
  NOTIFICATIONS: {
    component: lazy(() => import('./views/Notifications/NotificationsView')),
    theme: mainThemes.deepOrange,
    gridPosition: [0, 2],
  } as NavigationEntry,
} as const

/** Grid visualization for transition purposes **/
/*-----------------------------------------------
| DASHBOARD     | ROUTINES      | DATA_MANAGER  |
| TESTING       | CAPTCHA       | INFO          |
| NOTIFICATIONS | -             | -             |
------------------------------------------------*/
