export class Logger {
  private readonly prefix: string
  constructor(prefix = '') {
    this.prefix = prefix
  }

  log(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(this.prefix, ...args)
  }
  info(...args: unknown[]) {
    console.info(this.prefix, ...args)
  }
  error(...args: unknown[]) {
    console.error(this.prefix, ...args)
  }
  warn(...args: unknown[]) {
    console.warn(this.prefix, ...args)
  }
}
