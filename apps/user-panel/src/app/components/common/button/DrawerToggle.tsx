import { useEffect, useRef, type PropsWithChildren } from 'react'
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material'
import { Button, type ButtonProps, Stack } from '@mui/material'
import anime from 'animejs'

interface DrawerToggleProps extends Omit<ButtonProps, 'children'> {
  open: boolean
  onToggle: (open: boolean) => void
}

export const DrawerToggle = ({
  open,
  onToggle,
  children,
  ...buttonProps
}: PropsWithChildren<DrawerToggleProps>) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    anime({
      targets: contentRef.current.querySelector('svg:first-child'),
      scale: !open ? 1 : 0,
      opacity: !open ? 1 : 0,
      translateX: open ? '2rem' : '0rem',
      easing: 'easeInOutCirc',
      duration: 400,
    })
    anime({
      targets: contentRef.current.querySelector('svg:last-child'),
      scale: open ? 1 : 0,
      opacity: open ? 1 : 0,
      translateX: !open ? '-2rem' : '0rem',
      easing: 'easeInOutCirc',
      duration: 400,
    })
  }, [open])

  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      onClick={() => onToggle(!open)}
      {...buttonProps}
    >
      <Stack ref={contentRef} direction="row" alignItems="center" columnGap={1}>
        <ChevronLeftRounded />
        {children}
        <ChevronRightRounded />
      </Stack>
    </Button>
  )
}
