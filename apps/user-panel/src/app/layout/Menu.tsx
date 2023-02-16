import type { ReactNode } from 'react'
import { DashboardRounded, StorageRounded, type SvgIconComponent } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import {
  darken,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material'
import type { ViewName } from '../context/viewContext'
import { useView } from '../hooks/useView'

const menuEntries: { label: ReactNode; icon: SvgIconComponent; viewName: ViewName }[] = [
  { label: 'Dashboard', icon: DashboardRounded, viewName: 'DASHBOARD' },
  { label: 'Data manager', icon: StorageRounded, viewName: 'DATA_MANAGER' },
]

export const Menu = () => {
  const view = useView()

  return (
    <Stack
      alignItems="center"
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.2),
        transition: (theme) => theme.transitions.create('background-color'),
      }}>
      <List disablePadding>
        {menuEntries.map((entry) => {
          const selected = view.viewName === entry.viewName

          const textColorStyle: SxProps<Theme> = {
            color: (theme) =>
              selected ? theme.palette.text.primary : theme.palette.text.secondary,
            transition: (theme) => theme.transitions.create('color'),
          }

          return (
            <ListItem key={entry.viewName} disablePadding>
              <ListItemButton
                selected={selected}
                disableRipple={selected}
                disableTouchRipple={selected}
                onClick={selected ? undefined : () => view.requestViewChange(entry.viewName)}
                sx={textColorStyle}>
                <ListItemIcon sx={textColorStyle}>
                  <entry.icon color="inherit" />
                </ListItemIcon>
                <ListItemText primary={entry.label} color="inherit" />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Stack>
  )
}
