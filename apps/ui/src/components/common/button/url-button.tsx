import { mdiOpenInNew } from '@mdi/js'
import Icon from '@mdi/react'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { cn } from '~/lib/utils'

interface UrlButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: string
  maxWidth?: string | number
  readOnly?: boolean
}

export const UrlButton = ({ children: url, maxWidth, readOnly, ...linkProps }: UrlButtonProps) => {
  const Component = readOnly ? 'span' : 'a'

  return (
    <Component
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex flex-row justify-start items-center gap-1',
        !readOnly && 'hover:underline',
      )}
      onClick={(event: MouseEvent) => event.stopPropagation()}
      style={{ maxWidth }}
      {...linkProps}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{url}</span>
      {!readOnly && <Icon path={mdiOpenInNew} className="size-4 min-w-4 inline-block" />}
    </Component>
  )
}
