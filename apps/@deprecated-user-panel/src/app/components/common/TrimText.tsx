import type { FC } from 'react'

interface TrimTextProps {
  children: string
  maxLength: number
  side?: 'left' | 'right'
  affix?: string
}

export const TrimText: FC<TrimTextProps> = ({
  children: text,
  maxLength,
  side = 'right',
  affix = '...',
}) => {
  if (text.length > maxLength) {
    return side === 'left'
      ? `${affix}${text.slice(-maxLength + affix.length)}`
      : `${text.slice(0, maxLength - affix.length)}${affix}`
  }

  return text
}
