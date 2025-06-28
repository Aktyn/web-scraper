export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitFor(
  condition: () => boolean,
  /** If null, the function will wait indefinitely */
  timeout: number | null = 5000,
  interval = 100,
) {
  const startTime = Date.now()

  while (!condition()) {
    if (timeout !== null && Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition")
    }
    await wait(interval)
  }
}
