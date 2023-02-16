export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const waitFor = async (
  condition: () => Promise<boolean>,
  interval = 500,
  timeout = 10000,
) => {
  const start = Date.now()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await wait(interval)
    if (await condition()) {
      break
    }
    if (Date.now() - start > timeout) {
      throw new Error('Timeout')
    }
  }
}

export async function safePromise<DataType>(promise: Promise<DataType>): Promise<DataType | null>
export async function safePromise<DataType, FallbackDataType>(
  promise: Promise<DataType>,
  fallbackData?: FallbackDataType,
): Promise<FallbackDataType extends DataType ? DataType : FallbackDataType>

export async function safePromise<DataType, FallbackDataType>(
  promise: Promise<DataType>,
  fallbackData?: FallbackDataType,
) {
  try {
    return await promise
  } catch {
    if (fallbackData === undefined || fallbackData === null) {
      return null
    }
    return fallbackData as FallbackDataType extends DataType ? DataType : FallbackDataType
  }
}

export function debounce<FunctionType extends (...args: unknown[]) => unknown>(
  func: FunctionType,
  delay?: number,
  options: Partial<{ forceAfterNumberOfAttempts: number }> = {},
): [debouncedFunction: (...args: Parameters<typeof func>) => void, cancel: () => void] {
  let timeout: NodeJS.Timeout | null = null
  let attempts = 0

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return [
    (...args: Parameters<typeof func>) => {
      if (
        typeof options?.forceAfterNumberOfAttempts === 'number' &&
        options?.forceAfterNumberOfAttempts >= attempts
      ) {
        func(...args)
        cancel()
        attempts = 0
        return
      }

      cancel()
      attempts++
      timeout = setTimeout(() => {
        timeout = null
        attempts = 0
        func(...args)
      }, delay ?? 16) as never
    },
    cancel,
  ]
}
