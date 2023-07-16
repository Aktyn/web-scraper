import { type PropsWithChildren, useRef, useEffect } from 'react'
import { Stack, type StackProps } from '@mui/material'

export function HorizontallyScrollableContainer({
  children,
  ...stackProps
}: PropsWithChildren<Omit<StackProps, 'ref'>>) {
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
      event.preventDefault()
      container.scrollLeft += event.deltaY + event.deltaX
    }

    container.addEventListener('wheel', onWheel)

    return () => {
      container.removeEventListener('wheel', onWheel)
    }
  }, [])

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
