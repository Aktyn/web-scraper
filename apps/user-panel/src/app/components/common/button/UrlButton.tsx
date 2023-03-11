import { Link } from '@mui/material'
import type { LinkProps } from '@mui/material'

interface UrlProps extends LinkProps {
  children: string
}

export const Url = ({ children: url, ...linkProps }: UrlProps) => {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" {...linkProps}>
      {url}
    </Link>
  )
}
