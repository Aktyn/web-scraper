export function mix(value1: number, value2: number, factor: number) {
  return value1 * (1 - factor) + value2 * factor
}

export function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}
