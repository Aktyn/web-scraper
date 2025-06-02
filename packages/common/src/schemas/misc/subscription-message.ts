import { z } from "zod"

export enum SubscriptionMessageType {
  SubscriptionInitialized = "subscriptionInitialized",
}

export const subscriptionMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SubscriptionMessageType.SubscriptionInitialized),
    sessionId: z.string(),
  }),
])

export type SubscriptionMessage = z.infer<typeof subscriptionMessageSchema>
