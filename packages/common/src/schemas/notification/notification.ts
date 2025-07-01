import { z } from "zod"
import { apiPaginationQuerySchema, timestampSchema } from "../common"

export enum NotificationType {
  ScraperFinished = "scraperFinished",
}

export const notificationDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(NotificationType.ScraperFinished),
    scraperId: z.number().int().min(1),
    scraperName: z.string(),
    iterations: z.number().int().min(0),
  }),
])

export type NotificationData = z.infer<typeof notificationDataSchema>

const notificationBaseSchema = z.object({
  id: z.number().int().min(1),
  createdAt: timestampSchema,
  read: z.boolean().default(false),
})

export const notificationSchema = notificationDataSchema.and(
  notificationBaseSchema,
)

export type Notification = z.infer<typeof notificationSchema>

export const notificationQuerySchema = apiPaginationQuerySchema.extend({
  read: z.boolean().optional(),
})

export type NotificationQuery = z.infer<typeof notificationQuerySchema>
