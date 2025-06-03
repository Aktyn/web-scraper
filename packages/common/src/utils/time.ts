// istanbul ignore next
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// istanbul ignore next
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
) {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition")
    }
    await wait(interval)
  }
}
