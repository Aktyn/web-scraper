import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactNode,
  type PropsWithChildren,
} from 'react'
import { Divider, Drawer, type DrawerProps, Stack, Typography } from '@mui/material'

export interface CustomDrawerRef {
  open: () => void
  close: () => void
}

interface CustomDrawerProps extends Omit<DrawerProps, 'open' | 'onClose' | 'title'> {
  title?: ReactNode
}

export const CustomDrawer = forwardRef<CustomDrawerRef, PropsWithChildren<CustomDrawerProps>>(
  ({ children, title, ...drawerProps }, ref) => {
    const [open, setOpen] = useState(false)

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
      }),
      [],
    )

    const handleClose = () => setOpen(false)

    return (
      <Drawer anchor="right" {...drawerProps} open={open} onClose={handleClose}>
        <Stack>
          {title && (
            <>
              <Typography variant="h6" color="text.secondary" sx={{ p: 2 }}>
                {title}
              </Typography>
              <Divider />
            </>
          )}
          {children}
        </Stack>
      </Drawer>
    )
  },
)
