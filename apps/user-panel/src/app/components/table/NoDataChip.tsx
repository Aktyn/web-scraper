import { Chip } from '@mui/material'

export const NoDataChip = () => {
  return (
    <Chip
      label="NULL"
      sx={{ color: 'text.secondary', lineHeight: 1 }}
      variant="filled"
      size="small"
      color="default"
    />
  )
}
