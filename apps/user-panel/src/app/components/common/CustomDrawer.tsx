import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactNode,
  type PropsWithChildren,
  useCallback,
} from 'react'
import { CloseRounded } from '@mui/icons-material'
import { Divider, Drawer, type DrawerProps, IconButton, Stack, Typography } from '@mui/material'

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

    const handleClose = useCallback(() => setOpen(false), [])

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: handleClose,
      }),
      [handleClose],
    )

    return (
      <Drawer anchor="right" {...drawerProps} open={open} onClose={handleClose}>
        <Stack height="100%" justifyContent="flex-start">
          {title && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2 }}
              >
                <Typography variant="h6" color="text.secondary">
                  {title}
                </Typography>
                <IconButton onClick={handleClose}>
                  <CloseRounded />
                </IconButton>
              </Stack>
              <Divider />
            </>
          )}
          {children}
        </Stack>
      </Drawer>
    )
  },
)
