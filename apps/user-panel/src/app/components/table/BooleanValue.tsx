import { CheckRounded, CloseRounded } from '@mui/icons-material'
import { Box, type BoxProps, type SvgIconProps } from '@mui/material'
import { lightGreen, red } from '@mui/material/colors'

interface BooleanValueProps extends BoxProps {
  value: boolean
  iconProps?: SvgIconProps
}

export const BooleanValue = ({ value, iconProps, ...boxProps }: BooleanValueProps) => {
  return (
    <Box
      {...boxProps}
      sx={{ display: 'flex', color: value ? lightGreen[200] : red[200], ...boxProps.sx }}
    >
      {value ? (
        <CheckRounded color="inherit" {...iconProps} />
      ) : (
        <CloseRounded color="inherit" {...iconProps} />
      )}
    </Box>
  )
}
