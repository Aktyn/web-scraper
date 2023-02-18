import { forwardRef, memo } from 'react'

export const genericMemo: <T>(component: T) => T = memo
export const genericForwardRef: <T>(component: T) => T = forwardRef as never
