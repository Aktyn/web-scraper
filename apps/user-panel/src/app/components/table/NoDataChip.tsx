import { Chip } from '@mui/material'

export const NoDataChip = () => {
  return (
    <Chip
      className="no-data-chip"
      label="NULL"
      sx={{ color: 'text.secondary', lineHeight: 1 }}
      variant="filled"
      size="small"
      color="default"
    />
  )
}
