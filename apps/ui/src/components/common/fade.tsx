import { Slot } from '@radix-ui/react-slot'
import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

type FadeProps = {
  children: ReactNode
  in: boolean
  keepMounted?: boolean
  inClassName?: string
  outClassName?: string
  className?: string
  delay?: number
}

export function Fade({
  in: inProp,
  keepMounted,
  inClassName,
  outClassName,
  className,
  children,
  delay,
}: FadeProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (inProp) {
      setMounted(true)
      const visibleTimeout = setTimeout(() => {
        setVisible(true)
      }, delay ?? 16)
      return () => clearTimeout(visibleTimeout)
    } else {
      setVisible(false)
      const timeout = setTimeout(() => {
        setMounted(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [delay, inProp])

  if (!mounted && !keepMounted) {
    return null
  }

  return (
    <Slot
      className={cn(
        'transition-opacity duration-500',
        className,
        visible ? 'opacity-100' : 'opacity-0',
        visible ? inClassName : outClassName,
      )}
    >
      {children}
    </Slot>
  )
}
