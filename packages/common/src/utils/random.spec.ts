import { describe, it, expect } from "vitest"
import { uuid } from "./random"

describe("random", () => {
  describe(uuid.name, () => {
    it("should generate a random uuid", () => {
      expect(uuid()).toBeTypeOf("string")
    })

    it("should generate a uuid with the correct format", () => {
      expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })
})
