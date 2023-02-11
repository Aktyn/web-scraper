export function int(value?: string) {
  if (!value) return 0

  const parsed = parseInt(value)
  return isNaN(parsed) ? 0 : parsed
}
