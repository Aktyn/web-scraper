import type { ForwardRefExoticComponent, RefAttributes } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ForwardedReferenceType<Component extends ForwardRefExoticComponent<any>> =
  Component extends ForwardRefExoticComponent<infer X>
    ? X extends RefAttributes<infer Y>
      ? Y
      : never
    : never
