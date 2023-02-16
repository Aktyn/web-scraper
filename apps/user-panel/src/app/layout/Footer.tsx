import { LinkRounded } from '@mui/icons-material'
import { darken, Link, Stack, Typography } from '@mui/material'

export const Footer = () => {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      p={0.5}
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.2),
        transition: (theme) => theme.transitions.create('background-color'),
      }}>
      <Typography variant="caption" color="text.secondary">
        Web&nbsp;Scrapper&nbsp;v{process.env.REACT_APP_VERSION}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        &copy;&nbsp;2023&nbsp;Aktyn{' '}
        <Link href="https://github.com/Aktyn" target="_blank" sx={{ textDecoration: 'none' }}>
          GitHub <LinkRounded fontSize="inherit" />
        </Link>
      </Typography>
    </Stack>
  )
}
