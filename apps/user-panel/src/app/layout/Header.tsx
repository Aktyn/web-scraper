import { Stack } from '@mui/material'

export const headerSize = '2rem'

export const Header = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      height={headerSize}
      gridArea="header"
    >
      HEADER
    </Stack>
  )
}
