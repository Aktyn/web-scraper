import {
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useImperativeHandle,
  useState,
} from 'react'
import { Drawer, type DrawerProps, Stack } from '@mui/material'
import { CustomDrawerHeader } from './CustomDrawerHeader'
import { DrawerContext } from '../../context/drawerContext'

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
    const deferredOpen = useDeferredValue(open)

    const handleClose = useCallback(() => setOpen(false), [])

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: handleClose,
      }),
      [handleClose],
    )

    const anchor = drawerProps.anchor ?? 'right'

    return (
      <Drawer anchor={anchor} {...drawerProps} open={open} onClose={handleClose}>
        <Stack height="100%" justifyContent="flex-start" overflow="hidden">
          <CustomDrawerHeader title={title} onClose={handleClose} />
          <DrawerContext.Provider value={{ open, deferredOpen, anchor }}>
            {children}
          </DrawerContext.Provider>
        </Stack>
      </Drawer>
    )
  },
)
