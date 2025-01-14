import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '~/lib/utils'
import { Spinner } from '../common/spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 relative cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 rounded-md px-3',
        default: 'h-10 px-4 py-2 gap-3',
        lg: 'h-11 rounded-md px-8 gap-4',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && 'pointer-events-none overflow-hidden',
        )}
        ref={ref}
        {...props}
      >
        {asChild ? (
          loading ? (
            <div>
              {props.children}
              <LoadingLayer />
            </div>
          ) : (
            props.children
          )
        ) : (
          <>
            {props.children}
            {loading && <LoadingLayer />}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

function LoadingLayer() {
  return (
    <div className="absolute inset-0 backdrop-blur-xs flex items-center justify-center pointer-events-none overflow-hidden">
      <Spinner />
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
