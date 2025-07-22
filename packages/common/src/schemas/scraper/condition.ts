import { z } from "zod"
import { pageIndexSchema } from "./common"
import { scraperElementSelectorsSchema } from "./selectors"
import { scraperValueSchema } from "./value"

export enum ScraperConditionType {
  IsElementVisible = "isElementVisible",
  AreValuesEqual = "areValuesEqual",
}

export const scraperConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperConditionType.IsElementVisible),
    pageIndex: pageIndexSchema,
    selectors: scraperElementSelectorsSchema,
  }),
  z.object({
    type: z.literal(ScraperConditionType.AreValuesEqual),
    firstValueSelector: scraperValueSchema,
    secondValueSelector: scraperValueSchema,
  }),
])

export type ScraperCondition = z.infer<typeof scraperConditionSchema>
