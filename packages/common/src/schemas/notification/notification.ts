import { z } from "zod"

export enum NotificationType {
  ScraperFinished = "scraperFinished",
}

export const notificationDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(NotificationType.ScraperFinished),
    scraperId: z.number(),
    scraperName: z.string(),
    iterations: z.number(),
  }),
])

export type NotificationData = z.infer<typeof notificationDataSchema>

export const notificationSchema = notificationDataSchema.and(
  z.object({
    id: z.number(),
    createdAt: z.number(),
    read: z.boolean().default(false),
  }),
)

export type Notification = z.infer<typeof notificationSchema>
