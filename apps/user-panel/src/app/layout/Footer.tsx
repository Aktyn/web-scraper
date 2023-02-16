import { memo } from 'react'
import { LinkRounded } from '@mui/icons-material'
import { darken, Link, Stack, Typography } from '@mui/material'

export const Footer = memo(() => {
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
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ transition: (theme) => theme.transitions.create('color') }}>
        Web&nbsp;Scrapper&nbsp;v{process.env.REACT_APP_VERSION}
        {process.env.NODE_ENV === 'development' && (
          <span style={{ marginLeft: '0.25rem' }}>(dev)</span>
        )}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ transition: (theme) => theme.transitions.create('color') }}>
        &copy;&nbsp;2023&nbsp;Aktyn{' '}
        <Link
          href="https://github.com/Aktyn"
          target="_blank"
          sx={{
            textDecoration: 'none',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 0.5,
            transition: (theme) => theme.transitions.create('color'),
          }}>
          <span>GitHub</span>
          <LinkRounded fontSize="inherit" />
        </Link>
      </Typography>
    </Stack>
  )
})
