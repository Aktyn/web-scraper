import type { FunctionComponent, LazyExoticComponent } from 'react'
import { lazy } from 'react'
import type { Theme } from '@mui/material'
import { cyanMain, purpleMain } from './themes'

type ViewComponentType = FunctionComponent

interface NavigationEntry {
  component: LazyExoticComponent<ViewComponentType>
  theme?: Theme
  gridPosition: [number, number]
}

const Navigation = {
  DASHBOARD: {
    component: lazy(() => import('./views/DashboardView')),
    theme: cyanMain,
    gridPosition: [0, 0],
  } as NavigationEntry,
  DATA_MANAGER: {
    component: lazy(() => import('./views/DataManagerView')),
    theme: purpleMain,
    gridPosition: [0, 1],
  } as NavigationEntry,
} as const

export default Navigation

/** Grid visualization of transition purposes **/
/*-------------------------------
| DASHBOARD     | ------------- |
| ------------- | DATA_MANAGER  |
--------------------------------*/
