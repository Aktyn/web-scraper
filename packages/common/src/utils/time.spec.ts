import { describe, it, expect, vi, afterEach } from "vitest"
import { wait, waitFor } from "./time"

describe("time utils", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe("wait", () => {
    it("should resolve after the specified time", async () => {
      vi.useFakeTimers()
      const waitTime = 1000
      const promise = wait(waitTime)
      vi.advanceTimersByTime(waitTime)
      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe("waitFor", () => {
    it("should resolve when the condition is met", async () => {
      let condition = false
      setTimeout(() => {
        condition = true
      }, 50)
      await waitFor(() => condition)
    })

    it("should throw an error if the condition is not met within the timeout", async () => {
      const condition = () => false
      await expect(waitFor(condition, 100)).rejects.toThrow(
        "Timeout waiting for condition",
      )
    })
  })
})
