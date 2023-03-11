import { useContext, useRef } from 'react'
import { KeyRounded, ReorderRounded, TableRowsRounded } from '@mui/icons-material'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { CustomPopover, type CustomPopoverRef } from '../components/common/CustomPopover'
import { IconToggle } from '../components/common/button/IconToggle'
import { UserDataContext } from '../context/userDataContext'
import { EncryptionPasswordForm } from '../forms/EncryptionPasswordForm'

export const headerSize = '3rem'

export const Header = () => {
  const encryptionPopoverRef = useRef<CustomPopoverRef>(null)

  const { dataEncryptionPassword, settings, updateSetting } = useContext(UserDataContext)

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
      <IconToggle
        tooltipTitle="Toggle compact view for tables"
        options={tablesCompactViewToggleOptions}
        value={settings.tablesCompactMode ? 'compact' : 'default'}
        onChange={(value) => updateSetting('tablesCompactMode', value === 'compact')}
      />
      <Tooltip
        title={`${dataEncryptionPassword ? 'Change' : 'Set'} data encryption password`}
        disableInteractive
      >
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
