import { cn } from '~/lib/utils'
import './spinner.css'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('spinner size-5', className)}>
      <span />
      <span />
    </div>
  )
}