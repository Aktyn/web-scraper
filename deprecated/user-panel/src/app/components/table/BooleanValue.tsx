import { CheckRounded, CloseRounded } from '@mui/icons-material'
import { Box, type BoxProps, type SvgIconProps } from '@mui/material'
import { lightGreen, red } from '@mui/material/colors'

interface BooleanValueProps extends BoxProps {
  value: boolean
  iconProps?: SvgIconProps
  trueIcon?: typeof CheckRounded
  falseIcon?: typeof CloseRounded
}

export const BooleanValue = ({
  value,
  iconProps,
  trueIcon: TrueIcon = CheckRounded,
  falseIcon: FalseIcon = CloseRounded,
  ...boxProps
}: BooleanValueProps) => {
  return (
    <Box
      {...boxProps}
      sx={{ display: 'flex', color: value ? lightGreen[200] : red[200], ...boxProps.sx }}
    >
      {value ? (
        <TrueIcon color="inherit" {...iconProps} />
      ) : (
        <FalseIcon color="inherit" {...iconProps} />
      )}
    </Box>
  )
}
