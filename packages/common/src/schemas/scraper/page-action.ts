import z from "zod"
import { scraperSelectorSchema } from "./selector"
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
    url: z.string(),
  }),
  z.object({
    type: z.literal(PageActionType.Click),
    selector: scraperSelectorSchema,
  }),
  z.object({
    type: z.literal(PageActionType.Type),
    selector: scraperSelectorSchema,
    clearBeforeType: z.boolean().optional(),
    value: scraperValueSchema,
  }),
])

export type PageAction = z.infer<typeof pageActionSchema>
