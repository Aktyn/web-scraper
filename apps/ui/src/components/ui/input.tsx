import * as React from 'react'
import { cn } from '~/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          props.readOnly ? 'cursor-auto' : 'focus-visible:border-primary',
          props['aria-invalid'] === 'true' ||
            (props['aria-invalid'] === true &&
              'border-destructive focus-visible:border-destructive-focus [&:not(:focus-visible)]:animate-pulse'),
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
