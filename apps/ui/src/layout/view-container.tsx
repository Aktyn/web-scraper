import { useState, useEffect } from 'react'
import { cn } from '~/lib/utils'
import { Navigation } from '~/navigation'

type ViewContainerProps = {
  navigationItem: (typeof Navigation)[number]
  active: boolean
}

export function ViewContainer({ navigationItem, active }: ViewContainerProps) {
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
        'w-screen h-full transition-[transform,opacity] duration-500',
        active ? 'opacity-100 scale-100' : 'opacity-0 scale-golden-reverse',
      )}
    >
      {mount && <navigationItem.component />}
    </div>
  )
}
