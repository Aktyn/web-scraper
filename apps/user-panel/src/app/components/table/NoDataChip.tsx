import { Chip } from '@mui/material'

export const NoDataChip = () => {
  return (
    <Chip
      label="NULL"
      sx={{ color: 'text.secondary' }}
      variant="filled"
      size="small"
      color="default"
    />
  )
}
