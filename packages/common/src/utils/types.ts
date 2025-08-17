type LogMethods = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

export type SimpleLogger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in LogMethods]: (msg: unknown, ...args: any[]) => void
}

export type ExtendArray<T> = T extends Array<unknown> ? T : Array<T> | T
