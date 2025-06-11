import { z } from "zod"
import { notificationSchema } from "../notification/notification"
import { scraperEventSchema } from "../scraper/execution"

export enum SubscriptionMessageType {
  SubscriptionInitialized = "subscriptionInitialized",
  ScraperEvent = "scraperEvent",
  Notification = "notification",
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

  z.object({
    type: z.literal(SubscriptionMessageType.Notification),
    notification: notificationSchema,
  }),
])

export type SubscriptionMessage = z.infer<typeof subscriptionMessageSchema>
