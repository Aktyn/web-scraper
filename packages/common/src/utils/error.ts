export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

export function runUnsafe<T>(callback: () => T, onError = console.error): T | null {
  try {
    return callback()
  } catch (error) {
    onError(error instanceof Error ? error.message : String(error))
    return null
  }
}
