import { OpenInNewRounded } from '@mui/icons-material'
import { Box, Link, Stack, type LinkProps } from '@mui/material'

interface UrlButtonProps extends LinkProps {
  children: string
  maxWidth?: string | number
  readOnly?: boolean
}

export const UrlButton = ({ children: url, maxWidth, readOnly, ...linkProps }: UrlButtonProps) => {
  return (
    <Stack
      component={readOnly ? 'span' : Link}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      direction="row"
      alignItems="center"
      columnGap="0.25rem"
      {...linkProps}
    >
      <Box component="span" sx={{ maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {url}
      </Box>
      {!readOnly && <OpenInNewRounded fontSize="inherit" />}
    </Stack>
  )
}
