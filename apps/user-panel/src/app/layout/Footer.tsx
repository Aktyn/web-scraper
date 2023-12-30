import { memo } from 'react'
import { LinkRounded } from '@mui/icons-material'
import { darken, Link, Stack, Typography, type Theme } from '@mui/material'
import { commonLayoutTransitions } from './helpers'
import { AktynLogoIcon } from '../components/icons/AktynLogoIcon'

export const Footer = memo(() => {
  const textColor = (theme: Theme) => darken(theme.palette.text.secondary, 0.2)

  return (
    <Stack
      gridArea="footer"
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      p={1}
    >
      <Typography
        variant="caption"
        color={textColor}
        sx={{ transition: commonLayoutTransitions.color }}
      >
        v{process.env.REACT_APP_VERSION}
        {process.env.NODE_ENV === 'development' && (
          <span style={{ marginLeft: '0.25rem' }}>(dev)</span>
        )}
      </Typography>
      <Typography
        variant="caption"
        color={textColor}
        sx={{ transition: commonLayoutTransitions.color, display: 'flex', alignItems: 'center' }}
      >
        &copy;&nbsp;2023&nbsp;Aktyn&nbsp;
        <AktynLogoIcon fontSize="inherit" />
        &ensp;|&ensp;
        <Link
          href="https://github.com/Aktyn"
          target="_blank"
          sx={{
            color: textColor,
            textDecoration: 'none',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 0.5,
            transition: commonLayoutTransitions.color,
            '&:hover': {
              color: (theme) => theme.palette.text.primary,
            },
          }}
        >
          <LinkRounded fontSize="inherit" />
          <span>GitHub</span>
        </Link>
      </Typography>
    </Stack>
  )
})
