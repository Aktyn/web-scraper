import { describe, it, expect, vi } from "vitest"
import { assert, runUnsafe } from "./error"

describe("error utils", () => {
  describe(assert.name, () => {
    it("should not throw an error if the condition is true", () => {
      expect(() => assert(true, "This should not throw")).not.toThrow()
    })

    it("should throw an error if the condition is false", () => {
      expect(() => assert(false, "This should throw")).toThrow(
        "This should throw",
      )
    })
  })

  describe(runUnsafe.name, () => {
    it("should return the result of the callback if it succeeds", () => {
      const callback = () => "success"
      const result = runUnsafe(callback)
      expect(result).toBe("success")
    })

    it("should return null and call onError if the callback throws an error", () => {
      const callback = () => {
        throw new Error("failure")
      }
      const onError = vi.fn()
      const result = runUnsafe(callback, onError)
      expect(result).toBe(null)
      expect(onError).toHaveBeenCalledWith("failure")
    })

    it("should handle non-Error objects thrown", () => {
      const callback = () => {
        throw "failure"
      }
      const onError = vi.fn()
      const result = runUnsafe(callback, onError)
      expect(result).toBe(null)
      expect(onError).toHaveBeenCalledWith("failure")
    })
  })
})
