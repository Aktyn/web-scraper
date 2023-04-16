export function mix(value1: number, value2: number, factor: number) {
  return value1 * (1 - factor) + value2 * factor
}
