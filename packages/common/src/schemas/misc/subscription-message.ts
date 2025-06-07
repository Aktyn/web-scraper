import { z } from "zod"
import { scraperEventSchema } from "../scraper/execution"

export enum SubscriptionMessageType {
  SubscriptionInitialized = "subscriptionInitialized",
  ScraperEvent = "scraperEvent",
}

export const subscriptionMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SubscriptionMessageType.SubscriptionInitialized),
    sessionId: z.string(),
  }),
  z.object({
    type: z.literal(SubscriptionMessageType.ScraperEvent),
    scraperId: z.number(),
    event: scraperEventSchema,
  }),
])

export type SubscriptionMessage = z.infer<typeof subscriptionMessageSchema>
