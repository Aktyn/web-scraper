import { useContext, useEffect, useRef, useState } from 'react'
import {
  DarkModeRounded,
  KeyRounded,
  LightModeRounded,
  NotificationsOffRounded,
  NotificationsRounded,
  ReorderRounded,
  TableRowsRounded,
} from '@mui/icons-material'
import { Box, Divider, IconButton, Slider, Stack, Tooltip } from '@mui/material'
import anime from 'animejs'
import { WindowStateOptions } from './WindowStateOptions'
import { CustomPopover, type CustomPopoverRef } from '../components/common/CustomPopover'
import { HorizontallyScrollableContainer } from '../components/common/HorizontallyScrollableContainer'
import { IconToggle } from '../components/common/button/IconToggle'
import { Config } from '../config'
import { UserDataContext, defaultUserSettings } from '../context/userDataContext'
import { EncryptionPasswordForm } from '../forms/EncryptionPasswordForm'

export const headerSize = '3rem'

export const Header = () => {
  const encryptionPopoverRef = useRef<CustomPopoverRef>(null)
  const settingsContainer = useRef<HTMLDivElement>(null)

  const { dataEncryptionPassword, settings, updateSetting, loading } = useContext(UserDataContext)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading || !settingsContainer.current) {
      return
    }

    anime({
      targets: settingsContainer.current.querySelectorAll(':scope > *'),
      translateY: [`-${headerSize}`, '0rem'],
      easing: 'spring(0.7, 100, 10, 0)',
      delay: anime.stagger(300, { from: 'last' }),
      complete: () => setReady(true),
    })
  }, [loading])

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      px="0.5rem"
      gap="1rem"
      height={headerSize}
      gridArea="header"
      overflow="hidden"
      sx={
        ready
          ? {
              WebkitAppRegion: 'drag',
              userSelect: 'none',
              '& button, & .no-draggable': {
                WebkitAppRegion: 'no-drag',
              },
            }
          : undefined
      }
    >
      {!loading && (
        <HorizontallyScrollableContainer
          ref={settingsContainer}
          direction="row"
          alignItems="center"
          gap="1.5rem"
          px="1rem"
          height="100%"
        >
          <Tooltip
            title={
              <Stack alignItems="center">
                <Box>
                  Adjust theme coloring intensity (
                  {Math.round(
                    100 *
                      (settings.backgroundSaturation ??
                        defaultUserSettings.backgroundSaturation ??
                        0),
                  )}
                  %)
                </Box>
                <Box>The effect will be visible the next time you change view</Box>
              </Stack>
            }
            className="no-draggable"
          >
            <Stack
              direction="row"
              alignItems="center"
              gap="0.5rem"
              minWidth="12rem"
              color="text.primary"
            >
              <DarkModeRounded
                sx={{
                  opacity: Math.max(0.2, 1 - (settings.backgroundSaturation ?? 1)),
                  transition: (theme) => theme?.transitions.create('opacity', { easing: 'linear' }),
                }}
              />
              <Slider
                aria-label="Lightness"
                size="small"
                value={settings.backgroundSaturation}
                defaultValue={Config.DEFAULT_BACKGROUND_SATURATION}
                onChange={(_, value) =>
                  updateSetting('backgroundSaturation', Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="off"
                step={0.1}
                marks
                min={0}
                max={1}
              />
              <LightModeRounded
                sx={{
                  opacity: Math.max(0.2, settings.backgroundSaturation ?? 1),
                  transition: (theme) => theme?.transitions.create('opacity', { easing: 'linear' }),
                }}
              />
            </Stack>
          </Tooltip>
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
        </HorizontallyScrollableContainer>
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
      <Divider orientation="vertical" flexItem />
      <WindowStateOptions />
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
