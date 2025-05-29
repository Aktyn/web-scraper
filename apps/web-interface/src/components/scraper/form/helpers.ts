export function mapToSelectOptions<T extends string>(map: Record<T, string>) {
  return Object.entries(map).map(([key, value]) => ({
    value: key,
    label: value as string,
  }))
}
