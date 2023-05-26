import { useContext } from 'react'
import {
  DashboardRounded,
  EngineeringRounded,
  InfoRounded,
  StorageRounded,
} from '@mui/icons-material'
import { Box, List, Stack, Typography, useTheme } from '@mui/material'
import { headerSize } from './Header'
import { contentAreaBorderRadius } from './Layout'
import { MenuItem, type MenuItemProps } from './MenuItem'
import { commonLayoutTransitions } from './helpers'
import { ReactComponent as LogoIcon } from '../components/icons/icon.svg'
import { ApiContext } from '../context/apiContext'

const TestingLabel = () => {
  const { testingSessions } = useContext(ApiContext)

  return (
    <Box component="span">
      Testing
      {testingSessions.sessions.length > 0 && (
        <Box component="span" sx={{ fontSize: 'smaller', ml: '0.25rem', opacity: 0.5 }}>
          ({testingSessions.sessions.length})
        </Box>
      )}
    </Box>
  )
}

const menuEntries: MenuItemProps[] = [
  { label: 'Dashboard', icon: DashboardRounded, viewName: 'DASHBOARD' },
  { label: 'Data manager', icon: StorageRounded, viewName: 'DATA_MANAGER' },
  { label: <TestingLabel />, icon: EngineeringRounded, viewName: 'TESTING' },
  { label: 'Info', icon: InfoRounded, viewName: 'INFO' },
]

export const Menu = () => {
  const theme = useTheme()

  const scraperIconSize = `calc(${headerSize} + ${contentAreaBorderRadius} - 1.5rem)`

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
