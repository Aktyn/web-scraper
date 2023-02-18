import { memo } from 'react'
import { LinkRounded } from '@mui/icons-material'
import type { Theme } from '@mui/material'
import { darken, Link, Stack, Typography } from '@mui/material'
import { Config } from '../config'

export const Footer = memo(() => {
  const textColor = (theme: Theme) => darken(theme.palette.text.secondary, 0.2)
  const colorTransition = (theme: Theme) =>
    theme.transitions.create('color', { duration: Config.VIEW_TRANSITION_DURATION / 2 })

  return (
    <Stack
      gridArea="footer"
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      p={1}
    >
      <Typography variant="caption" color={textColor} sx={{ transition: colorTransition }}>
        v{process.env.REACT_APP_VERSION}
        {process.env.NODE_ENV === 'development' && (
          <span style={{ marginLeft: '0.25rem' }}>(dev)</span>
        )}
      </Typography>
      <Typography variant="caption" color={textColor} sx={{ transition: colorTransition }}>
        &copy;&nbsp;2023&nbsp;Aktyn&ensp;|&ensp;
        <Link
          href="https://github.com/Aktyn"
          target="_blank"
          fontWeight="bold"
          sx={{
            color: textColor,
            textDecoration: 'none',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 0.5,
            transition: colorTransition,
            '&:hover': {
              color: (theme) => theme.palette.text.primary,
            },
          }}
        >
          <span>GitHub</span>
          <LinkRounded fontSize="inherit" />
        </Link>
      </Typography>
    </Stack>
  )
})
