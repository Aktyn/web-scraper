import { useContext, useEffect, useRef } from 'react'
import {
  KeyRounded,
  NotificationsOffRounded,
  NotificationsRounded,
  ReorderRounded,
  TableRowsRounded,
} from '@mui/icons-material'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import anime from 'animejs'
import { CustomPopover, type CustomPopoverRef } from '../components/common/CustomPopover'
import { IconToggle } from '../components/common/button/IconToggle'
import { UserDataContext } from '../context/userDataContext'
import { EncryptionPasswordForm } from '../forms/EncryptionPasswordForm'

export const headerSize = '3rem'

export const Header = () => {
  const encryptionPopoverRef = useRef<CustomPopoverRef>(null)
  const settingsContainer = useRef<HTMLDivElement>(null)

  const { dataEncryptionPassword, settings, updateSetting, loading } = useContext(UserDataContext)

  useEffect(() => {
    if (loading || !settingsContainer.current) {
      return
    }

    anime({
      targets: settingsContainer.current.querySelectorAll(':scope > *'),
      translateY: [`-${headerSize}`, '0rem'],
      easing: 'spring(0.7, 100, 10, 0)',
      delay: anime.stagger(300, { from: 'last' }),
    })
  }, [loading])

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      px={1}
      gap={2}
      height={headerSize}
      gridArea="header"
    >
      {!loading && (
        <Stack ref={settingsContainer} direction="row" alignItems="center" gap={2}>
          <IconToggle
            tooltipTitle="Toggle desktop notifications"
            options={desktopNotificationsToggleOptions}
            value={!!settings.desktopNotifications}
            onChange={(value) => updateSetting('desktopNotifications', value)}
          />
          <IconToggle
            tooltipTitle="Toggle compact view for tables"
            options={tablesCompactViewToggleOptions}
            value={settings.tablesCompactMode ? 'compact' : 'default'}
            onChange={(value) => updateSetting('tablesCompactMode', value === 'compact')}
          />
        </Stack>
      )}
      <Tooltip title={`${dataEncryptionPassword ? 'Change' : 'Set'} data encryption password`}>
        <Box>
          <IconButton
            color={dataEncryptionPassword ? 'success' : 'warning'}
            onClick={(event) => encryptionPopoverRef.current?.open(event.currentTarget)}
          >
            <KeyRounded />
          </IconButton>
        </Box>
      </Tooltip>
      <CustomPopover
        ref={encryptionPopoverRef}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <EncryptionPasswordForm onSave={encryptionPopoverRef.current?.close} />
      </CustomPopover>
    </Stack>
  )
}

const tablesCompactViewToggleOptions = [
  {
    value: 'default',
    icon: <TableRowsRounded fontSize="inherit" />,
  },
  {
    value: 'compact',
    icon: <ReorderRounded fontSize="inherit" />,
  },
] as const

const desktopNotificationsToggleOptions = [
  {
    value: true,
    icon: <NotificationsRounded fontSize="inherit" />,
  },
  {
    value: false,
    icon: <NotificationsOffRounded fontSize="inherit" />,
  },
] as const
