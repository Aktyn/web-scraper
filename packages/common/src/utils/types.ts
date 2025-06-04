export type SimpleLogger = Pick<
  typeof console,
  "trace" | "debug" | "info" | "warn" | "error"
> & {
  fatal: typeof console.error
}

export type ExtendArray<T> = T extends Array<unknown> ? T : Array<T> | T
