import { describe, expect, it } from "vitest"
import { ElementSelectorType } from "./selectors"
import {
  ScraperValueType,
  scraperDataKeySchema,
  scraperValueSchema,
} from "./value"

describe("scraperDataKeySchema", () => {
  it("should parse valid data key", () => {
    const result = scraperDataKeySchema.safeParse("DataSource.Column")
    expect(result.success).toBe(true)
  })

  it("should fail for invalid data key", () => {
    const result = scraperDataKeySchema.safeParse("InvalidKey")
    expect(result.success).toBe(false)
  })

  it("should fail for non-string value", () => {
    const result = scraperDataKeySchema.safeParse(123)
    expect(result.success).toBe(false)
  })
})

describe("scraperValueSchema", () => {
  it("should parse literal value", () => {
    const value = { type: ScraperValueType.Literal, value: "test" }
    const result = scraperValueSchema.safeParse(value)
    expect(result.success).toBe(true)
  })

  it("should parse current timestamp value", () => {
    const value = { type: ScraperValueType.CurrentTimestamp }
    const result = scraperValueSchema.safeParse(value)
    expect(result.success).toBe(true)
  })

  it("should parse external data value", () => {
    const value = {
      type: ScraperValueType.ExternalData,
      dataKey: "Source.Column",
    }
    const result = scraperValueSchema.safeParse(value)
    expect(result.success).toBe(true)
  })

  it("should parse element text content value", () => {
    const value = {
      type: ScraperValueType.ElementTextContent,
      selectors: [{ type: ElementSelectorType.Query, query: "div" }],
    }
    const result = scraperValueSchema.safeParse(value)
    expect(result.success).toBe(true)
  })

  it("should parse element attribute value", () => {
    const value = {
      type: ScraperValueType.ElementAttribute,
      selectors: [{ type: ElementSelectorType.Query, query: "div" }],
      attributeName: "data-test",
    }
    const result = scraperValueSchema.safeParse(value)
    expect(result.success).toBe(true)
  })
})
