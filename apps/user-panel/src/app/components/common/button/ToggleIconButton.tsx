import { type ReactNode, type Dispatch, type SetStateAction, useEffect, useRef } from 'react'
import { CloseRounded, EditRounded } from '@mui/icons-material'
import { IconButton, type SvgIconProps, Tooltip } from '@mui/material'
import anime from 'animejs'

interface ToggleIconButtonProps {
  open: boolean
  onToggle: Dispatch<SetStateAction<boolean>>
  closeTooltip?: ReactNode
  openTooltip?: ReactNode
}

export const ToggleIconButton = ({
  open,
  onToggle,
  openTooltip,
  closeTooltip,
}: ToggleIconButtonProps) => {
  const editButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    anime({
      targets: editButtonRef.current?.querySelector('svg:first-of-type'),
      easing: 'spring(0.7, 100, 10, 0)',
      opacity: open ? 0 : 1,
      rotate: open ? -90 : 0,
    })
    anime({
      targets: editButtonRef.current?.querySelector('svg:last-of-type'),
      easing: 'spring(0.7, 100, 10, 0)',
      opacity: open ? 1 : 0,
      rotate: open ? 0 : 90,
    })
  }, [open])

  return (
    <Tooltip title={open ? openTooltip : closeTooltip}>
      <IconButton
        ref={editButtonRef}
        size="small"
        onClick={() => onToggle((open) => !open)}
        sx={{ position: 'relative', width: '1.75rem', height: '1.75rem' }}
      >
        <EditRounded {...toggleIconProps} />
        <CloseRounded {...toggleIconProps} />
      </IconButton>
    </Tooltip>
  )
}

const toggleIconProps: SvgIconProps = {
  fontSize: 'inherit',
  sx: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
  },
}
