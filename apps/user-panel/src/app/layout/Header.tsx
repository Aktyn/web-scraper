import { useContext, useRef } from 'react'
import { KeyRounded } from '@mui/icons-material'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { CustomPopover, type CustomPopoverRef } from '../components/common/CustomPopover'
import { UserSettingsContext } from '../context/userSettingsContext'
import { EncryptionPasswordForm } from '../forms/EncryptionPasswordForm'

export const headerSize = '3rem'

export const Header = () => {
  const encryptionPopoverRef = useRef<CustomPopoverRef>(null)

  const { dataEncryptionPassword } = useContext(UserSettingsContext)

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      px={1}
      height={headerSize}
      gridArea="header"
    >
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
