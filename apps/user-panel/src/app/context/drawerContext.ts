import { createContext } from 'react'
import type { DrawerProps } from '@mui/material'

export const DrawerContext = createContext({
  open: false,
  deferredOpen: false,
  anchor: undefined as DrawerProps['anchor'],
})
