import { useEffect, useRef, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'
import { CloseRounded, EditRounded } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Tooltip,
  type IconButtonProps,
  type SvgIconTypeMap,
  type BoxProps,
} from '@mui/material'
import { type OverridableComponent } from '@mui/material/OverridableComponent'
import anime from 'animejs'

type IconComponent = OverridableComponent<SvgIconTypeMap<unknown, 'svg'>> & { muiName: string }

interface ToggleIconButtonProps {
  open: boolean
  onToggle: (open: boolean, event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void
  closeTooltip?: ReactNode
  openTooltip?: ReactNode
  closedStateIcon?: IconComponent
  openedStateIcon?: IconComponent
  boxProps?: BoxProps
}

export const ToggleIconButton = ({
  open,
  onToggle,
  openTooltip,
  closeTooltip,
  closedStateIcon: ClosedIcon = EditRounded,
  openedStateIcon: OpenedIcon = CloseRounded,
  boxProps,
  ...iconButtonProps
}: ToggleIconButtonProps & IconButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    anime({
      targets: buttonRef.current?.querySelector('svg:first-of-type'),
      easing: 'spring(0.7, 100, 10, 0)',
      opacity: open ? 0 : 1,
      rotate: open ? -90 : 0,
    })
    anime({
      targets: buttonRef.current?.querySelector('svg:last-of-type'),
      easing: 'spring(0.7, 100, 10, 0)',
      opacity: open ? 1 : 0,
      rotate: open ? 0 : 90,
    })
  }, [open])

  return (
    <Tooltip title={open ? openTooltip : closeTooltip}>
      <Box {...boxProps}>
        <IconButton
          ref={buttonRef}
          onClick={(event) => onToggle(!open, event)}
          {...iconButtonProps}
          sx={{
            position: 'relative',
            ...iconButtonProps.sx,
          }}
        >
          <ClosedIcon />
          <OpenedIcon
            sx={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, margin: 'auto' }}
          />
        </IconButton>
      </Box>
    </Tooltip>
  )
}
