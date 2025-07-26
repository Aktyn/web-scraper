import {
  ElementSelectorType,
  replaceSpecialStrings,
  type ScraperElementSelectors,
  type SimpleLogger,
  type SpecialStringContext,
} from "@web-scraper/common"
import { describe, expect, it } from "vitest"
import {
  type DataBridge,
  type DataBridgeValue,
  replaceSpecialStringsInSelectors,
} from "./data-helper"
import type { ExecutionPages } from "./execution/execution-pages"
import type { ScraperExecutionContext } from "./execution/helpers"

const voidLogger = Object.entries(console).reduce(
  (acc, [key, value]) => {
    if (typeof value === "function") {
      acc[key as keyof SimpleLogger] = () => {}
    } else {
      acc[key as keyof SimpleLogger] = value as never
    }
    return acc
  },
  {
    fatal: console.error,
  } as SimpleLogger,
)

const mockStore = new Map<string, DataBridgeValue>([
  ["user.name", "test-user"],
  ["user.password", "test-password"],
  ["button.next", "Next >"],
  ["product.name", "Super Product"],
  ["product.price", 99.99],
  ["product.attribute", "data-testid"],
  ["product.attributeValue", "product-price-id"],
  ["user.greeting", "Hello {{DataKey,user.name}}"],
])

const mockDataBridge: DataBridge = {
  getSchema: async () => ({
    "user.name": "string",
    "user.password": "string",
    "button.next": "string",
    "product.name": "string",
    "product.price": "number",
    "product.attribute": "string",
    "product.attributeValue": "string",
    "user.greeting": "string",
  }),

  get: async (key) => {
    return mockStore.get(key) ?? null
  },
  set: async (key: string, value) => {
    mockStore.set(key, value)
  },
  setMany: async (dataSourceName: string, items) => {
    for (const item of items) {
      mockStore.set(`${dataSourceName}.${item.columnName}`, item.value)
    }
  },
  delete: async (key: string) => {
    for (const existingKey of mockStore.keys()) {
      if (existingKey.startsWith(key)) {
        mockStore.delete(existingKey)
      }
    }
  },
}

const mockSpecialStringContext: SpecialStringContext = {
  logger: voidLogger,
  getExternalData: (key) => mockDataBridge.get(key),
  getPageUrl: (_pageIndex?: number) => "http://mock-url.com",
}

describe("data-helper", () => {
  describe(replaceSpecialStrings.name, () => {
    it("should return the same string if no special strings are present", async () => {
      const input = "This is a simple string."
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe(input)
    })

    it("should replace a single special string with its value from the data bridge", async () => {
      const input = "Welcome, {{DataKey,user.name}}!"
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe("Welcome, test-user!")
    })

    it("should replace multiple special strings", async () => {
      const input =
        "Product: {{DataKey,product.name}}, Price: ${{DataKey,product.price}}, User: {{DataKey,user.name}}"
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe(
        "Product: Super Product, Price: $99.99, User: test-user",
      )
    })

    it("should replace a special string with an empty string if the key is not in the data bridge", async () => {
      const input = "This key {{DataKey,nonexistent.key}} does not exist."
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe("This key  does not exist.")
    })

    it("should handle a mix of existing and non-existing keys", async () => {
      const input =
        "User: {{DataKey,user.name}}, Status: {{DataKey,user.status}}"
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe("User: test-user, Status: ")
    })

    it("should handle recursive replacement", async () => {
      const input = "Greeting: {{DataKey,user.greeting}}"
      const result = await replaceSpecialStrings(
        input,
        mockSpecialStringContext,
      )
      expect(result).toBe("Greeting: Hello test-user")
    })
  })

  describe(replaceSpecialStringsInSelectors.name, () => {
    const mockContext = {
      logger: voidLogger,
      dataBridge: mockDataBridge,
      pages: {
        getPage: () => ({ url: () => "http://mock-url.com" }),
      } as unknown as ExecutionPages,
    } as ScraperExecutionContext

    it("should replace special strings in various selector types", async () => {
      const selectors: ScraperElementSelectors = [
        {
          type: ElementSelectorType.Query,
          query: "button[id='{{DataKey,button.next}}']",
        },
        {
          type: ElementSelectorType.TextContent,
          text: "{{DataKey,product.name}}",
        },
        {
          type: ElementSelectorType.TagName,
          tagName: "div",
        },
        {
          type: ElementSelectorType.Attributes,
          attributes: {
            "{{DataKey,product.attribute}}":
              "{{DataKey,product.attributeValue}}",
            "static-attr": "Welcome, {{DataKey,user.name}}",
            "non-existent": "{{DataKey,non.existent}}",
          },
        },
      ]

      const result = await replaceSpecialStringsInSelectors(
        mockContext,
        selectors,
      )

      expect(result).toEqual([
        {
          type: ElementSelectorType.Query,
          query: "button[id='Next >']",
        },
        {
          type: ElementSelectorType.TextContent,
          text: "Super Product",
        },
        {
          type: ElementSelectorType.TagName,
          tagName: "div",
        },
        {
          type: ElementSelectorType.Attributes,
          attributes: {
            "data-testid": "product-price-id",
            "static-attr": "Welcome, test-user",
            "non-existent": "",
          },
        },
      ])
    })

    it("should not replace special strings in regex values", async () => {
      const selectors: ScraperElementSelectors = [
        {
          type: ElementSelectorType.TextContent,
          text: { source: "{{DataKey,user.name}}", flags: "i" },
        },
        {
          type: ElementSelectorType.Attributes,
          attributes: {
            "data-regex": { source: "{{DataKey,product.name}}", flags: "g" },
          },
        },
      ]

      const result = await replaceSpecialStringsInSelectors(
        mockContext,
        selectors,
      )

      expect(result).toEqual([
        {
          type: ElementSelectorType.TextContent,
          text: { source: "{{DataKey,user.name}}", flags: "i" },
        },
        {
          type: ElementSelectorType.Attributes,
          attributes: {
            "data-regex": { source: "{{DataKey,product.name}}", flags: "g" },
          },
        },
      ])
    })
  })
})
