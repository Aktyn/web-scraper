import z from "zod"
import { scraperElementSelectorsSchema } from "./selectors"
import { scraperValueSchema } from "./value"

export enum PageActionType {
  Wait = "wait",
  Navigate = "navigate",
  Click = "click",
  Type = "type",
}

export const pageActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(PageActionType.Wait),
    duration: z.number(),
  }),
  z.object({
    type: z.literal(PageActionType.Navigate),
    url: z.string().url("Invalid URL"),
  }),
  z.object({
    type: z.literal(PageActionType.Click),
    selectors: scraperElementSelectorsSchema,
  }),
  z.object({
    type: z.literal(PageActionType.Type),
    selectors: scraperElementSelectorsSchema,
    clearBeforeType: z.boolean().optional(),
    value: scraperValueSchema,
  }),
])

export type PageAction = z.infer<typeof pageActionSchema>
