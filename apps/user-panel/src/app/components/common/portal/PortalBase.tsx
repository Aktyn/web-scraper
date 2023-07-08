import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { createPortal } from 'react-dom'

interface PortalBaseProps {
  element: HTMLElement | null
}

export const PortalBase = memo(({ children, element }: PropsWithChildren<PortalBaseProps>) => {
  if (!element) {
    return null
  }
  return createPortal(children, element)
})
