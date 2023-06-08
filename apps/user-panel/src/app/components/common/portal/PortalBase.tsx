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
  //@ts-expect-error types mismatch between react-dom and react
  return createPortal(children, element)
})
