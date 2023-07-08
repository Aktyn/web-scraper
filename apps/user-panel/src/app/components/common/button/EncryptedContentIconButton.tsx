import { useContext } from 'react'
import { LockRounded } from '@mui/icons-material'
import { Badge, badgeClasses, IconButton, type IconButtonProps, Tooltip } from '@mui/material'
import { UserDataContext } from '../../../context/userDataContext'

export const EncryptedContentIconButton = (props: IconButtonProps) => {
  const { dataEncryptionPassword } = useContext(UserDataContext)

  if (dataEncryptionPassword !== null) {
    return <IconButton {...props} />
  }

  return (
    <Tooltip title="Press the key icon in the top right corner to unlock this button">
      <Badge
        overlap="circular"
        badgeContent={<LockRounded color="disabled" sx={{ width: '1rem', height: '1rem' }} />}
        sx={{
          [`& > .${badgeClasses.badge}`]: {
            px: 0,
          },
        }}
      >
        <IconButton {...props} disabled />
      </Badge>
    </Tooltip>
  )
}
