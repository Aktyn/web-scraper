import { useEffect, useRef } from 'react'
import { CircleRounded, RadioButtonUncheckedRounded } from '@mui/icons-material'
import { Box, Button, type ButtonProps } from '@mui/material'
import anime from 'animejs'

interface ToggleButtonProps extends ButtonProps {
  active: boolean
  onToggle: (active: boolean) => void
}

export const ToggleButton = ({ active, onToggle, ...buttonProps }: ToggleButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    anime({
      targets: buttonRef.current?.querySelector('.toggle-circle'),
      easing: 'easeInOutCirc',
      translateX: '-50%',
      translateY: '-50%',
      scale: active ? 0.5 : 0,
      duration: 200,
    })
  }, [active])

  return (
    <Button
      ref={buttonRef}
      color={active ? 'secondary' : 'primary'}
      onClick={(event) => {
        onToggle(!active)
        buttonProps.onClick?.(event)
      }}
      endIcon={
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <RadioButtonUncheckedRounded />
          <CircleRounded
            className="toggle-circle"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
            }}
          />
        </Box>
      }
      {...buttonProps}
      sx={{
        ...buttonProps.sx,
      }}
    />
  )
}
