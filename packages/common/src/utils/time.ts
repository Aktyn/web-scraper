// istanbul ignore next
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
