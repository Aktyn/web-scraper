export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target } as Record<string, unknown>

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key as never] as unknown
      const targetValue = target[key as never] as unknown

      if (isObject(sourceValue)) {
        if (isObject(targetValue)) {
          output[key] = deepMerge(targetValue, sourceValue)
        } else {
          output[key] = sourceValue
        }
      } else if (Array.isArray(sourceValue)) {
        if (Array.isArray(targetValue)) {
          output[key] = targetValue.concat(sourceValue)
        } else {
          output[key] = sourceValue
        }
      } else {
        output[key] = sourceValue
      }
    })
  }

  return output as T
}

function isObject(item: unknown): item is object {
  return typeof item === "object" && item !== null && !Array.isArray(item)
}
