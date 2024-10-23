import { type ComponentType, type CSSProperties, useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

type ViewContainerProps = {
  component: ComponentType
  active: boolean
  className?: string
  style?: CSSProperties
}

export function ViewContainer({
  component: Component,
  active,
  className,
  style,
}: ViewContainerProps) {
  const [mount, setMount] = useState(true)

  useEffect(() => {
    if (active) {
      setMount(true)
    } else {
      const timeout = setTimeout(() => {
        setMount(false)
      }, 600)

      return () => clearTimeout(timeout)
    }
  }, [active])

  return (
    <div
      className={cn(
        'w-screen h-full transition-opacity duration-500',
        active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        className,
      )}
      style={style}
    >
      {mount && <Component />}
    </div>
  )
}
