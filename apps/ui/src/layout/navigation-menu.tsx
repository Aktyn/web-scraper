import { Button } from '~/components/ui/button'
import { useView } from '~/context/view-context'
import { cn } from '~/lib/utils'
import { Navigation } from '~/navigation'

export function NavigationMenu({ className }: { className?: string }) {
  return (
    <div
      role="navigation"
      className={cn('grid gap-2 max-w-5xl', className)}
      style={{
        gridTemplateColumns: `repeat(${Navigation.length}, 1fr)`,
      }}
    >
      <NavigationButtons />
    </div>
  )
}

function NavigationButtons() {
  const { view, setView } = useView()

  return (
    <>
      {Navigation.map((item) => (
        <Button
          key={item.view}
          className={cn(
            '!opacity-100 hover:bg-accent/60 border border-primary duration-500',
            view === item.view ? 'bg-accent hover:bg-accent' : 'border-transparent',
          )}
          variant="ghost"
          size="default"
          disabled={view === item.view}
          onClick={() => setView(item.view)}
        >
          {item.label}
        </Button>
      ))}
    </>
  )
}
