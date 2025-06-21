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

const notificationBaseSchema = z.object({
  id: z.number(),
  createdAt: z.number(),
  read: z.boolean().default(false),
})

export const notificationSchema = notificationDataSchema.and(
  notificationBaseSchema,
)

export type Notification = z.infer<typeof notificationSchema>
