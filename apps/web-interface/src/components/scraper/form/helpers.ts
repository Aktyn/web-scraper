import type { ReactNode } from "react"

export function mapToSelectOptions<T extends string>(
  map: Record<T, ReactNode>,
) {
  return Object.entries(map).map(([key, value]) => ({
    value: key,
    label: value as string,
  }))
}
