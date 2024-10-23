import { Slot } from '@radix-ui/react-slot'
import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

type FadeProps = {
  in: boolean
  inClassName?: string
  outClassName?: string
  children: ReactNode
}

export function Fade({ in: inProp, inClassName, outClassName, children }: FadeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (inProp) {
      setMounted(true)
    } else {
      const timeout = setTimeout(() => {
        setMounted(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [inProp])

  if (!mounted) {
    return null
  }

  return (
    <Slot
      className={cn(
        inProp ? 'animate-in fade-in' : 'animate-out fade-out',
        inProp && inClassName,
        !inProp && outClassName,
      )}
    >
      {children}
    </Slot>
  )
}
