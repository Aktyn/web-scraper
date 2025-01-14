import Icon from '@mdi/react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Fade } from '~/components/ui/fade'
import { useView } from '~/context/view-context'
import { cn } from '~/lib/utils'
import { NAVIGATION, type View } from '~/navigation'

type NavigationMenuProps = {
  className?: string
  onNavigate?: (view: View) => void
}

export function NavigationMenu({ className, onNavigate }: NavigationMenuProps) {
  return (
    <div
      role="navigation"
      className={cn('grid gap-2 max-w-5xl', className)}
      style={{
        gridTemplateColumns: `repeat(${NAVIGATION.length}, 1fr)`,
      }}
    >
      {NAVIGATION.map((item) => (
        <NavigationItem key={item.view} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  )
}

function NavigationItem({
  item,
  onNavigate,
}: {
  item: (typeof NAVIGATION)[number]
  onNavigate?: (view: View) => void
}) {
  const { view, setView } = useView()

  const [subLabel, setSubLabel] = useState('')

  const subView = item.subViews.find((subView) => subView.view === view)
  const active = item.view === view || !!subView

  useEffect(() => {
    if (subView?.label) {
      setSubLabel(subView.label)
    }
  }, [subView?.label])

  return (
    <Button
      key={item.view}
      className={cn(
        'opacity-100! hover:bg-accent/60 border border-primary duration-500 overflow-hidden',
        active ? 'bg-accent hover:bg-accent' : 'border-transparent',
      )}
      variant="ghost"
      size="default"
      disabled={item.view === view}
      onClick={() => {
        setView(item.view)
        onNavigate?.(item.view)
      }}
    >
      <Icon path={item.svgPath} className="size-12" />
      <div className="flex flex-col items-start relative">
        <span className={cn('transition-transform duration-500', subView ? '-translate-y-1' : '')}>
          {item.label}
        </span>
        <Fade
          in={!!subView}
          className="transition-[opacity,transform]"
          inClassName="translate-y-0"
          outClassName="translate-y-1"
        >
          <span className="text-xs h-0 -mt-2 mb-2 absolute bottom-0 left-0 duration-500">
            {subLabel}
          </span>
        </Fade>
      </div>
    </Button>
  )
}
