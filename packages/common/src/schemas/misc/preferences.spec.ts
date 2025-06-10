import { describe, it, expect } from "vitest"
import { userPreferencesSchema } from "./preferences"

describe("preferencesSchema", () => {
  it("should validate a correct preferences array", () => {
    const preferences = [{ key: "headless", value: true }]
    const result = userPreferencesSchema.safeParse(preferences)
    expect(result.success).toBe(true)
  })

  it("should fail if the array contains invalid objects", () => {
    const preferences = [{ key: "theme", value: 123 }]
    const result = userPreferencesSchema.safeParse(preferences)
    expect(result.success).toBe(false)
  })

  it("should fail if it is not an array", () => {
    const preferences = { key: "theme", value: "dark" }
    const result = userPreferencesSchema.safeParse(preferences)
    expect(result.success).toBe(false)
  })
})
