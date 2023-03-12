import { type ReactElement, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Config } from '../../config'

const RootPortal = ({ children }: { children: ReactElement }) => {
  const rootRef = useRef(document.getElementById(Config.rootElementId))

  if (!rootRef.current) {
    return <>{children}</>
  }
  return createPortal(children, rootRef.current)
}

export default RootPortal
