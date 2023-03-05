import { forwardRef, type PropsWithChildren, useImperativeHandle, useState } from 'react'
import type { PopoverProps } from '@mui/material'
import { alpha, lighten, Popover } from '@mui/material'

export interface CustomPopoverRef {
  open: (anchorElement: HTMLButtonElement) => void
  close: () => void
}

interface CustomPopoverProps extends Omit<PopoverProps, 'open' | 'anchorEl' | 'onClose'> {
  glass?: boolean
}

export const CustomPopover = forwardRef<CustomPopoverRef, PropsWithChildren<CustomPopoverProps>>(
  ({ children, glass, ...popoverProps }, ref) => {
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
      <Popover
        PaperProps={{
          sx: {
            border: (theme) => `1px solid ${lighten(theme.palette.background.paper, 0.2)}`,
            backgroundColor: glass
              ? (theme) => alpha(theme.palette.background.paper, 0.5)
              : undefined,
            backdropFilter: glass ? 'blur(4px)' : undefined,
          },
        }}
        {...popoverProps}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        {children}
      </Popover>
    )
  },
)
