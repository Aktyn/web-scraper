import { describe, it, expect, vi, beforeEach } from "vitest"
import { replaceSpecialStrings } from "./special-strings"
import type { ScraperDataKey } from "../scraper"

describe(replaceSpecialStrings.name, () => {
  const getExternalData = vi.fn(async (key: ScraperDataKey) => {
    if (key === "dataSource1.column1") {
      return "mockedValue"
    }
    if (key === "dataSource2.column2") {
      return 123
    }
    return null
  })

  beforeEach(() => {
    getExternalData.mockClear()
  })

  it("should return the same string if no special strings are present", async () => {
    const text = "this is a normal string"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toBe(text)
    expect(getExternalData).not.toHaveBeenCalled()
  })

  it("should replace a RandomString special string with a random string of default length", async () => {
    const text = "here is a random string: {{RandomString}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toMatch(/^here is a random string: [a-zA-Z0-9]{16}$/)
  })

  it("should replace a RandomString special string with a random string of specified length", async () => {
    const text = "here is a random string: {{RandomString,8}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toMatch(/^here is a random string: [a-zA-Z0-9]{8}$/)
  })

  it("should replace a DataKey special string with data from getExternalData", async () => {
    const text = "Value is {{DataKey,dataSource1.column1}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toBe("Value is mockedValue")
    expect(getExternalData).toHaveBeenCalledWith("dataSource1.column1")
  })

  it("should handle multiple special strings", async () => {
    const text =
      "random: {{RandomString,5}}, data: {{DataKey,dataSource2.column2}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toMatch(/^random: [a-zA-Z0-9]{5}, data: 123$/)
    expect(getExternalData).toHaveBeenCalledWith("dataSource2.column2")
  })

  it("should handle multiple data keys", async () => {
    const text =
      "data1: {{DataKey,dataSource1.column1}}, data2: {{DataKey,dataSource2.column2}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toBe("data1: mockedValue, data2: 123")
    expect(getExternalData).toHaveBeenCalledWith("dataSource1.column1")
    expect(getExternalData).toHaveBeenCalledWith("dataSource2.column2")
  })

  it("should throw an error for invalid DataKey format", async () => {
    const text = "invalid: {{DataKey,invalidKey}}"
    await expect(replaceSpecialStrings(text, getExternalData)).rejects.toThrow(
      "Data key special string must have at least one argument",
    )
  })

  it("should throw an error for unknown special string type", async () => {
    const text = "unknown: {{UnknownType,arg}}"
    await expect(replaceSpecialStrings(text, getExternalData)).rejects.toThrow(
      "Unknown special string type: UnknownType",
    )
  })

  it("should replace special string and return empty string if getExternalData returns null", async () => {
    const text = "Value is {{DataKey,dataSource1.columnUnknown}}"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toBe("Value is ")
    expect(getExternalData).toHaveBeenCalledWith("dataSource1.columnUnknown")
  })

  it("should handle strings with multiple of the same special string", async () => {
    const text =
      "Value is {{DataKey,dataSource1.column1}} and {{DataKey,dataSource1.column1}} again"
    const result = await replaceSpecialStrings(text, getExternalData)
    expect(result).toBe("Value is mockedValue and mockedValue again")
    expect(getExternalData).toHaveBeenCalledTimes(2)
    expect(getExternalData).toHaveBeenCalledWith("dataSource1.column1")
  })
})
