import type { PropsWithChildren, ReactNode } from 'react'
import { useContext } from 'react'
import {
  drawerClasses,
  type DrawerProps,
  Paper,
  Slide,
  type SlideProps,
  Stack,
} from '@mui/material'
import { CustomDrawerHeader } from './CustomDrawerHeader'
import { DrawerPortal } from './portal/DrawerPortal'
import { DrawerContext } from '../../context/drawerContext'

interface NestedDrawerProps {
  open: boolean
  title?: ReactNode
  onClose?: () => void
}

export const NestedDrawer = ({
  children,
  open,
  title,
  onClose,
}: PropsWithChildren<NestedDrawerProps>) => {
  const drawerContext = useContext(DrawerContext)

  return (
    <DrawerPortal>
      <Slide
        direction={anchorToDirectionMap[drawerContext.anchor ?? 'right']}
        in={open && drawerContext.deferredOpen}
        mountOnEnter
        unmountOnExit
      >
        <Paper square className={drawerClasses.paper} elevation={16} sx={{ ml: '1rem' }}>
          <Stack height="100%" justifyContent="flex-start">
            <CustomDrawerHeader title={title} onClose={onClose} />
            {children}
          </Stack>
        </Paper>
      </Slide>
    </DrawerPortal>
  )
}

const anchorToDirectionMap = {
  left: 'right',
  right: 'left',
  top: 'down',
  bottom: 'up',
} satisfies { [key in Required<DrawerProps>['anchor']]: SlideProps['direction'] }
