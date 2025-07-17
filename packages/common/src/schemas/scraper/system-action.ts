import { z } from "zod"

export enum SystemActionType {
  ShowNotification = "showNotification",
  ExecuteSystemCommand = "executeSystemCommand",
}

export const systemActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SystemActionType.ShowNotification),
    message: z.string(),
  }),
  z.object({
    type: z.literal(SystemActionType.ExecuteSystemCommand),
    command: z.string(),
  }),
])

export type SystemAction = z.infer<typeof systemActionSchema>
