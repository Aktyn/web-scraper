import { type PropsWithChildren, useRef, useEffect, forwardRef } from 'react'
import { Stack, type StackProps } from '@mui/material'

type HorizontallyScrollableContainerProps = PropsWithChildren<
  {
    scrollStrengthFactor?: number
    allowVerticalScroll?: boolean
  } & Omit<StackProps, 'ref'>
>

export const HorizontallyScrollableContainer = forwardRef<
  HTMLDivElement,
  HorizontallyScrollableContainerProps
>(
  (
    { children, scrollStrengthFactor = 1, allowVerticalScroll = false, ...stackProps },
    forwardedRef,
  ) => {
    const localRef = useRef<HTMLDivElement>(null)
    const ref = forwardedRef ?? localRef

    useEffect(() => {
      const container = typeof ref === 'function' ? null : ref.current
      if (!container) {
        return
      }

      const onWheel = (event: WheelEvent) => {
        const hasVisibleScroll = container.scrollWidth > container.clientWidth
        if (!hasVisibleScroll) {
          return
        }

        const hasVisibleVerticalScroll = container.scrollHeight > container.clientHeight
        if (hasVisibleVerticalScroll && allowVerticalScroll) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        container.scrollTo({
          left: container.scrollLeft + (event.deltaY + event.deltaX) * scrollStrengthFactor,
          behavior: 'instant',
        })
      }

      container.addEventListener('wheel', onWheel)

      return () => {
        container.removeEventListener('wheel', onWheel)
      }
    }, [allowVerticalScroll, ref, scrollStrengthFactor])

    return (
      <Stack
        ref={ref}
        direction="row"
        flexWrap="nowrap"
        {...stackProps}
        sx={{ overflowY: 'hidden', scrollBehavior: 'smooth', ...stackProps.sx, overflowX: 'auto' }}
      >
        {children}
      </Stack>
    )
  },
)
