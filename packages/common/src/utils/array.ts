export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function uniqueBy<T>(array: T[], key: (item: T) => string): T[] {
  return [...new Map(array.map((item) => [key(item), item])).values()]
}
