import { z } from "zod"
import { notificationSchema } from "../notification/notification"
import { scraperEventSchema } from "../scraper/execution"
import { routineSchema } from "../routine"

export enum SubscriptionMessageType {
  SubscriptionInitialized = "subscriptionInitialized",
  ScraperEvent = "scraperEvent",
  Notification = "notification",
  RoutineUpdated = "routineUpdated",
}

const subscriptionInitialized = z.object({
  type: z.literal(SubscriptionMessageType.SubscriptionInitialized),
  sessionId: z.string(),
})

const scraperEvent = z.object<{
  type: z.ZodLiteral<SubscriptionMessageType.ScraperEvent>
  scraperId: z.ZodNumber
  event: typeof scraperEventSchema
}>({
  type: z.literal(SubscriptionMessageType.ScraperEvent),
  scraperId: z.number().int().min(1),
  event: scraperEventSchema,
})

const notification = z.object({
  type: z.literal(SubscriptionMessageType.Notification),
  notification: notificationSchema,
})

const routineUpdated = z.object({
  type: z.literal(SubscriptionMessageType.RoutineUpdated),
  routine: routineSchema,
})

export const subscriptionMessageSchema = z.discriminatedUnion("type", [
  subscriptionInitialized,
  scraperEvent,
  notification,
  routineUpdated,
])

export type SubscriptionMessage = z.infer<typeof subscriptionMessageSchema>
