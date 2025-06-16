export const defaultPreferences = {
  headless: {
    value: true,
    description:
      "Starts the browser in headless mode. Set to false to see the browser window during scraper execution.",
  },
  chromeExecutablePath: {
    value: "",
    description:
      "Path to the Chrome executable. If not set, the default path will be used.",
  },
  proxyURL: {
    value: "",
    description:
      "Proxy URL to use for the browser. If not set, no proxy will be used.",
  },
  portalURL: {
    value: "http://localhost:3000",
    description:
      "URL for the portal feature to work. If not set, the portal will not be used.",
  },
  viewportWidth: {
    value: 1920,
    description:
      "Width of the viewport. This influences how the pages are rendered.",
  },
  viewportHeight: {
    value: 1080,
    description:
      "Height of the viewport. This influences how the pages are rendered.",
  },
} satisfies Record<string, { value: unknown; description: string | null }>
