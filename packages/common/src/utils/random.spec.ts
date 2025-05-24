import { describe, it, expect } from "vitest"
import { randomInt, randomString, uuid } from "./random"

describe("random", () => {
  describe(uuid.name, () => {
    it("should generate a random uuid", () => {
      expect(uuid()).toBeTypeOf("string")
    })

    it("should generate a uuid with the correct format", () => {
      expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })

  describe(randomString.name, () => {
    it("should generate a random string", () => {
      expect(randomString(10)).toBeTypeOf("string")
    })

    it("should generate a string with the correct length", () => {
      expect(randomString(10)).toHaveLength(10)
    })
  })

  describe(randomInt.name, () => {
    it("should generate a random integer", () => {
      expect(randomInt(1, 10)).toBeTypeOf("number")
    })

    it("should generate an integer within the given range", () => {
      expect(randomInt(1, 10)).toBeGreaterThanOrEqual(1)
      expect(randomInt(1, 10)).toBeLessThanOrEqual(10)
    })
  })
})
