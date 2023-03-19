import type { PropsWithChildren } from 'react'
import { drawerClasses } from '@mui/material'
import { PortalBase } from './PortalBase'

export const DrawerPortal = ({ children }: PropsWithChildren) => {
  return (
    <PortalBase element={document.querySelector(`.${drawerClasses.root}`)}>{children}</PortalBase>
  )
}
