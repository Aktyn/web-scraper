import { z } from "zod"

export enum SystemActionType {
  ShowNotification = "showNotification",
}

export const systemActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SystemActionType.ShowNotification),
    message: z.string(),
  }),
])

export type SystemAction = z.infer<typeof systemActionSchema>
