import { describe, expect, it } from "vitest"
import { ElementSelectorType, scraperElementSelectorsSchema } from "./selectors"

describe("scraperElementSelectorsSchema", () => {
  it("should parse valid selectors", () => {
    const selectors = [
      { type: ElementSelectorType.Query, query: ".class" },
      { type: ElementSelectorType.TagName, tagName: "div" },
    ]
    const result = scraperElementSelectorsSchema.safeParse(selectors)
    expect(result.success).toBe(true)
  })

  it("should fail if selectors array is empty", () => {
    const selectors: unknown[] = []
    const result = scraperElementSelectorsSchema.safeParse(selectors)
    expect(result.success).toBe(false)
  })

  it("should fail if there are duplicate selector types", () => {
    const selectors = [
      { type: ElementSelectorType.Query, query: ".class" },
      { type: ElementSelectorType.Query, query: "#id" },
    ]
    const result = scraperElementSelectorsSchema.safeParse(selectors)
    expect(result.success).toBe(false)
  })

  describe("Attributes selector", () => {
    it("should parse valid attributes selector", () => {
      const selectors = [
        {
          type: ElementSelectorType.Attributes,
          attributes: { "data-test": "value" },
        },
      ]
      const result = scraperElementSelectorsSchema.safeParse(selectors)
      expect(result.success).toBe(true)
    })

    it("should fail if attributes object is empty", () => {
      const selectors = [
        { type: ElementSelectorType.Attributes, attributes: {} },
      ]
      const result = scraperElementSelectorsSchema.safeParse(selectors)
      expect(result.success).toBe(false)
    })
  })
})
