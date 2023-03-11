import { forwardRef, type PropsWithChildren, useImperativeHandle, useState } from 'react'
import type { PopoverProps } from '@mui/material'
import { Popover } from '@mui/material'

export interface CustomPopoverRef {
  open: (anchorElement: HTMLButtonElement) => void
  close: () => void
}

type CustomPopoverProps = Omit<PopoverProps, 'open' | 'anchorEl' | 'onClose'>

export const CustomPopover = forwardRef<CustomPopoverRef, PropsWithChildren<CustomPopoverProps>>(
  ({ children, ...popoverProps }, ref) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        open: setAnchorEl,
        close: () => setAnchorEl(null),
      }),
      [],
    )

    const handleClose = () => setAnchorEl(null)

    //TODO: title, content entry animations

    return (
      <Popover {...popoverProps} open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose}>
        {children}
      </Popover>
    )
  },
)
