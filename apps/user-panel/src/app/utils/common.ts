import { forwardRef, memo } from 'react'

export const genericMemo: <T>(component: T) => T = memo
export const genericForwardRef: <T>(component: T) => T = forwardRef as never

/** Do nothing */
export const noop = () => {}

export async function copyToClipboard(text: string) {
  const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
  if (result.state !== 'granted') {
    return false
  }
  navigator.clipboard.writeText(text).catch(console.error)
  return true
}

export function formatDate(date: Date) {
  return date.toLocaleString(navigator.language, dateFormat)
}

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
} as const
