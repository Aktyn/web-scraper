import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

import { cn } from '~/lib/utils'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, children, ...props }, ref) => {
  if (children && orientation !== 'horizontal') {
    throw new Error('Separator children are only supported for horizontal orientation')
  }

  if (children) {
    return (
      <div
        className={cn(
          'w-full inline-grid items-center justify-center grid-cols-[1fr_auto_1fr] gap-x-4',
          className,
        )}
      >
        <SeparatorPrimitive.Root
          decorative={decorative}
          orientation={orientation}
          className="shrink-0 bg-border h-[1px]"
          {...props}
        />
        {children}
        <SeparatorPrimitive.Root
          decorative={decorative}
          orientation={orientation}
          className="shrink-0 bg-border h-[1px]"
          {...props}
        />
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  )
})
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
