const executeScraperCommandDisclaimer = "used with `execute-scraper` command"

export const cliOptions = {
  silent: {
    description: "Do not print any logs to the console",
    defaultValue: false,
  },
  inMemoryDatabase: {
    description: "Use in-memory database",
    defaultValue: false,
  },
  noOpen: {
    description: "Prevents opening of web interface on startup",
    defaultValue: false,
  },
  scraper: {
    description: `Scraper to execute. Can be a name of an existing scraper, path to JSON file or stringified JSON object. (${executeScraperCommandDisclaimer})`,
    defaultValue: undefined as string | undefined,
  },
  iterator: {
    description: `Optional iterator configuration to use for the scraper execution. Can be provided as JSON string or path to JSON file. (${executeScraperCommandDisclaimer})`,
    defaultValue: undefined as string | undefined,
  },
}

export type CliArguments = {
  [key in keyof typeof cliOptions]: (typeof cliOptions)[key]["defaultValue"]
}
