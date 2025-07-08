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
      "URL for the portal feature to work. If not set, the portal will not be used. This feature is using puppeteer-extra-plugin-portal package.",
  },

  useAdblockerPlugin: {
    value: true,
    description: "Use the puppeteer-extra-plugin-adblocker package.",
  },

  useStealthPlugin: {
    value: true,
    description: "Use the puppeteer-extra-plugin-stealth package.",
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

  localizationModel: {
    value: "qwen2.5vl:32b",
    description:
      "Ollama model to use for the localization AI. If not set, the default model will be used (qwen2.5vl:32b). See https://ollama.com/search for list of available models. Ollama must be installed and running in order to use this feature. The model must be already available in Ollama.",
  },
  localizationSystemPrompt: {
    value:
      "Localize an element on the GUI image according to user's instructions and output a click position.",
    description:
      "System prompt for the localization AI. If not set, no system message will be sent to the AI which may result in less accurate localization.",
  },

  navigationModel: {
    value: "qwen2.5vl:32b",
    description:
      "Same as localizationModel, but for running autonomous agents (page navigation).",
  },
} as const satisfies Record<
  string,
  { value: unknown; description: string | null }
>
