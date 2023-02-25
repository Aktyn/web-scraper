import { DashboardRounded, InfoRounded, StorageRounded } from '@mui/icons-material'
import { List, Stack, Typography, useTheme } from '@mui/material'
import { headerSize } from './Header'
import { contentAreaBorderRadius } from './Layout'
import { MenuItem, type MenuItemProps } from './MenuItem'
import { commonLayoutTransitions } from './helpers'
import { ReactComponent as LogoIcon } from '../components/icons/icon.svg'

const menuEntries: MenuItemProps[] = [
  { label: 'Dashboard', icon: DashboardRounded, viewName: 'DASHBOARD' },
  { label: 'Data manager', icon: StorageRounded, viewName: 'DATA_MANAGER' },
  { label: 'Info', icon: InfoRounded, viewName: 'INFO' },
]

export const Menu = () => {
  const theme = useTheme()

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
            transition: commonLayoutTransitions.fill(theme),
          }}
        />
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.secondary"
          sx={{ transition: commonLayoutTransitions.color }}
        >
          Web Scraper
        </Typography>
      </Stack>
      <List disablePadding>
        {menuEntries.map((entry) => (
          <MenuItem key={entry.viewName} {...entry} />
        ))}
      </List>
    </Stack>
  )
}
