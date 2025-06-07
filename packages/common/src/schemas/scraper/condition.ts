import { z } from "zod"
import { serializableRegex } from "./helpers"
import { scraperElementSelectorsSchema } from "./selectors"
import { scraperValueSchema } from "./value"

export enum ScraperConditionType {
  IsVisible = "isVisible",
  TextEquals = "textEquals",

  //TODO: add data source condition
}

export const scraperConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperConditionType.IsVisible),
    selectors: scraperElementSelectorsSchema,
  }),
  z.object({
    type: z.literal(ScraperConditionType.TextEquals),
    valueSelector: scraperValueSchema,
    text: z.union([z.string(), serializableRegex]),
  }),
])

export type ScraperCondition = z.infer<typeof scraperConditionSchema>
