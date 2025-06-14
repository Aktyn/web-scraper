export const defaultPreferences = {
  headless: {
    value: true,
    description:
      "Starts the browser in headless mode. Set to false to see the browser window during scraper execution.",
  },
  proxyURL: {
    value: "",
    description:
      "Proxy URL to use for the browser. If not set, no proxy will be used.",
  },
  chromeExecutablePath: {
    value: "",
    description:
      "Path to the Chrome executable. If not set, the default path will be used.",
  },
} satisfies Record<string, { value: unknown; description: string | null }>
