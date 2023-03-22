import { CheckRounded, CloseRounded } from '@mui/icons-material'
import { Box, type BoxProps } from '@mui/material'
import { lightGreen, red } from '@mui/material/colors'

export const BooleanValue = ({ value, ...boxProps }: { value: boolean } & BoxProps) => {
  return (
    <Box
      {...boxProps}
      sx={{ display: 'flex', color: value ? lightGreen[200] : red[200], ...boxProps.sx }}
    >
      {value ? <CheckRounded color="inherit" /> : <CloseRounded color="inherit" />}
    </Box>
  )
}
