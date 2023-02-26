import { CheckRounded, CloseRounded } from '@mui/icons-material'
import { Box } from '@mui/material'
import { lightGreen, red } from '@mui/material/colors'

export const BooleanValue = ({ value }: { value: boolean }) => {
  return (
    <Box sx={{ color: value ? lightGreen[200] : red[200] }}>
      {value ? <CheckRounded color="inherit" /> : <CloseRounded color="inherit" />}
    </Box>
  )
}
