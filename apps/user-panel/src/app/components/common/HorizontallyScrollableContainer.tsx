import { type PropsWithChildren, useRef, useEffect } from 'react'
import { Stack, type StackProps } from '@mui/material'

type HorizontallyScrollableContainerProps = PropsWithChildren<
  {
    scrollStrengthFactor?: number
    allowVerticalScroll?: boolean
  } & Omit<StackProps, 'ref'>
>

export function HorizontallyScrollableContainer({
  children,
  scrollStrengthFactor = 1,
  allowVerticalScroll = false,
  ...stackProps
}: HorizontallyScrollableContainerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
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
  }, [allowVerticalScroll, scrollStrengthFactor])

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
}
