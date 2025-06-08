import { describe, it, expect } from "vitest"
import { preferencesSchema } from "./preferences"

describe("preferencesSchema", () => {
  it("should validate a correct preferences array", () => {
    const preferences = [
      { key: "theme", value: "dark" },
      { key: "language", value: "en" },
    ]
    const result = preferencesSchema.safeParse(preferences)
    expect(result.success).toBe(true)
  })

  it("should fail if the array contains invalid objects", () => {
    const preferences = [{ key: "theme", value: 123 }]
    const result = preferencesSchema.safeParse(preferences)
    expect(result.success).toBe(false)
  })

  it("should fail if it is not an array", () => {
    const preferences = { key: "theme", value: "dark" }
    const result = preferencesSchema.safeParse(preferences)
    expect(result.success).toBe(false)
  })
})
