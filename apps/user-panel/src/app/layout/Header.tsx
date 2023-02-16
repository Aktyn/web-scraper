import { darken, Stack } from '@mui/material'

export const Header = () => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.2),
        transition: (theme) => theme.transitions.create('background-color'),
      }}>
      HEADER
    </Stack>
  )
}
