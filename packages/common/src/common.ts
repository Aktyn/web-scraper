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
