export function cacheable<DataType, T>(
  this: T,
  func: () => DataType,
  cacheLifetime = Number.MAX_SAFE_INTEGER,
) {
  let cachedValue: DataType
  let cacheTimestamp = null as null | number

  return () => {
    const now = Date.now()

    if (cacheTimestamp === null || now - cacheTimestamp >= cacheLifetime) {
      cachedValue = func()
      cacheTimestamp = now
    }
    return cachedValue
  }
}
