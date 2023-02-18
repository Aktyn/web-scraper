import type { ReactNode } from 'react'
import { DashboardRounded, StorageRounded, type SvgIconComponent } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { headerSize } from './Header'
import { contentAreaBorderRadius } from './Layout'
import { ReactComponent as LogoIcon } from '../components/icons/icon.svg'
import type { ViewName } from '../context/viewContext'
import { useView } from '../hooks/useView'

const menuEntries: { label: ReactNode; icon: SvgIconComponent; viewName: ViewName }[] = [
  { label: 'Dashboard', icon: DashboardRounded, viewName: 'DASHBOARD' },
  { label: 'Data manager', icon: StorageRounded, viewName: 'DATA_MANAGER' },
]

export const Menu = () => {
  const view = useView()
  const theme = useTheme()

  const colorTransition = theme.transitions.create('color')
  const scraperIconSize = `calc(${headerSize} + ${contentAreaBorderRadius} - 0.5rem)`

  return (
    <Stack alignItems="center" gridArea="menu">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        width="100%"
        height={`calc(${headerSize} + ${contentAreaBorderRadius})`}
        px="0.5rem"
        spacing={2}
      >
        <LogoIcon
          style={{
            width: scraperIconSize,
            height: scraperIconSize,
            fill: theme.palette.text.secondary,
            transition: theme.transitions.create('fill'),
          }}
        />
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.secondary"
          sx={{ transition: colorTransition }}
        >
          Web Scraper
        </Typography>
      </Stack>
      <List disablePadding>
        {menuEntries.map((entry) => {
          const selected = view.viewName === entry.viewName

          const textColorStyle: SxProps<Theme> = {
            color: (theme) =>
              selected ? theme.palette.text.primary : theme.palette.text.secondary,
            transition: colorTransition,
          }

          return (
            <ListItem key={entry.viewName} disablePadding>
              <ListItemButton
                selected={selected}
                disableRipple={selected}
                disableTouchRipple={selected}
                onClick={selected ? undefined : () => view.requestViewChange(entry.viewName)}
                sx={textColorStyle}
              >
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
