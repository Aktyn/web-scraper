import { useContext, useState } from 'react'
import { CheckCircleOutlineRounded, Visibility, VisibilityOff } from '@mui/icons-material'
import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { UserSettingsContext } from '../context/userSettingsContext'

export const EncryptionPasswordForm = ({ onSave }: { onSave?: () => void }) => {
  const { dataEncryptionPassword, setDataEncryptionPassword } = useContext(UserSettingsContext)

  const [showPassword, setShowPassword] = useState(false)
  const [internalPassword, setInternalPassword] = useState(dataEncryptionPassword ?? '')

  return (
    <Stack alignItems="center" spacing={2} p={2} width="24rem" maxWidth="100%">
      <Typography>
        Some data such as site account credentials must be encrypted with password so that no third
        party user can access it by stealing database file.
      </Typography>
      <TextField
        value={internalPassword ?? ''}
        onChange={(event) => setInternalPassword(event.target.value)}
        variant="standard"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword((show) => !show)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="outlined"
        color="primary"
        endIcon={<CheckCircleOutlineRounded />}
        disabled={internalPassword === (dataEncryptionPassword ?? '')}
        onClick={() => {
          setDataEncryptionPassword(internalPassword || null)
          onSave?.()
        }}
      >
        Save
      </Button>
    </Stack>
  )
}
