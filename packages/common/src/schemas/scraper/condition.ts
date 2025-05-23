import { z } from "zod"
import { scraperElementSelectorSchema } from "./selector"
import { scraperValueSchema } from "./value"

export enum ScraperConditionType {
  IsVisible = "isVisible",
  TextEquals = "textEquals",
}

export const scraperConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperConditionType.IsVisible),
    selector: scraperElementSelectorSchema,
  }),
  z.object({
    type: z.literal(ScraperConditionType.TextEquals),
    valueSelector: scraperValueSchema,
    text: z.union([z.string(), z.instanceof(RegExp)]),
  }),
])

export type ScraperCondition = z.infer<typeof scraperConditionSchema>
