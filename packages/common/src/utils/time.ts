// istanbul ignore next
export function wait(ms: number) {
  if (process.env.CI) {
    return Promise.resolve()
  }

  return new Promise((resolve) => setTimeout(resolve, ms))
}

// istanbul ignore next
export async function waitFor(condition: () => boolean, timeout: number) {
  const startTime = Date.now()
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout")
    }

    await wait(100)
  }
}
