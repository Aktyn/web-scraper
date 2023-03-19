import type { PropsWithChildren } from 'react'
import { PortalBase } from './PortalBase'
import { Config } from '../../../config'

export const RootPortal = ({ children }: PropsWithChildren) => {
  return <PortalBase element={document.getElementById(Config.rootElementId)}>{children}</PortalBase>
}
