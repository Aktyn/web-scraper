import { describe, it, expect } from "vitest"
import {
  subscriptionMessageSchema,
  SubscriptionMessageType,
} from "./subscription-message"
import { ScraperEventType } from "../scraper"

describe("subscriptionMessageSchema", () => {
  it("should validate a subscription initialized message", () => {
    const message = {
      type: SubscriptionMessageType.SubscriptionInitialized,
      sessionId: "test-session-id",
    }
    const result = subscriptionMessageSchema.safeParse(message)
    expect(result.success).toBe(true)
  })

  it("should validate a scraper event message", () => {
    const message = {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: 1,
      event: {
        type: ScraperEventType.ExecutionFinished,
        executionInfo: [],
      },
    }
    const result = subscriptionMessageSchema.safeParse(message)
    expect(result.success).toBe(true)
  })

  it("should fail for an invalid message type", () => {
    const message = {
      type: "invalid-type",
    }
    const result = subscriptionMessageSchema.safeParse(message)
    expect(result.success).toBe(false)
  })
})
