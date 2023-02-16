// eslint-disable-next-line @typescript-eslint/naming-convention

export const int = <T>(value: T) => parseInt(value as string) || 0
export const float = <T>(value: T) => parseFloat(value as string) || 0

// eslint-disable-next-line @typescript-eslint/naming-convention
export function tryParseJSON<ValueType>(
  jsonString: string | null,
  defaultValue: ValueType,
): ValueType
// eslint-disable-next-line @typescript-eslint/naming-convention
export function tryParseJSON<ValueType>(jsonString: string | null): ValueType | null

// eslint-disable-next-line @typescript-eslint/naming-convention
export function tryParseJSON<ValueType>(jsonString: string | null, defaultValue?: ValueType) {
  if (!jsonString) {
    return defaultValue ?? null
  }
  try {
    return JSON.parse(jsonString) ?? defaultValue ?? null
  } catch {
    return defaultValue ?? null
  }
}
