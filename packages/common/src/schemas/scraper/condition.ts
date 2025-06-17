import { z } from "zod"
import { pageIndexSchema, serializableRegex } from "./common"
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
    pageIndex: pageIndexSchema,
    selectors: scraperElementSelectorsSchema,
  }),
  z.object({
    type: z.literal(ScraperConditionType.TextEquals),
    valueSelector: scraperValueSchema,
    text: z.union([z.string(), serializableRegex]),
  }),
])

export type ScraperCondition = z.infer<typeof scraperConditionSchema>
