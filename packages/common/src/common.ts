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

export async function safePromise<DataType, FallbackDataType>(
  promise: Promise<DataType>,
  fallbackData?: FallbackDataType,
) {
  try {
    return await promise
  } catch {
    return fallbackData as FallbackDataType extends DataType ? DataType : FallbackDataType
  }
}
