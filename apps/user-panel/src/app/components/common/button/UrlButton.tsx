import { OpenInNewRounded } from '@mui/icons-material'
import { Box, Link, Stack, type LinkProps } from '@mui/material'

interface UrlButtonProps extends LinkProps {
  children: string
  maxWidth?: string | number
}

export const UrlButton = ({ children: url, maxWidth, ...linkProps }: UrlButtonProps) => {
  return (
    <Stack
      component={Link}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      direction="row"
      alignItems="center"
      spacing={0.5}
      {...linkProps}
    >
      <Box component="span" sx={{ maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {url}
      </Box>
      <OpenInNewRounded fontSize="inherit" />
    </Stack>
  )
}
