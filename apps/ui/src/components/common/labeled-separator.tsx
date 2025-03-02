import { type ComponentProps } from 'react'
import { cn } from '~/lib/utils'
import { Separator } from '../ui/separator'

type LabeledSeparatorProps = {
  className?: string
} & ComponentProps<'div'>

export function LabeledSeparator({ children, ...divProps }: LabeledSeparatorProps) {
  return (
    <div
      {...divProps}
      className={cn(
        'w-full inline-grid items-center justify-center grid-cols-[1fr_auto_1fr] gap-x-4',
        divProps.className,
      )}
    >
      <Separator />
      {children}
      <Separator />
    </div>
  )
}
