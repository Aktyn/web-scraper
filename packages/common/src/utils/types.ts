export type SimpleLogger = Pick<typeof console, "trace" | "debug" | "info" | "warn" | "error"> & {
  fatal: typeof console.error
}
