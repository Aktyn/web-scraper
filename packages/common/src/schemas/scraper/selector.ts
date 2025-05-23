import { z } from "zod"
import { tagNameSchema } from "./helpers"

export enum SelectorType {
  Query = "query",
  FindByTextContent = "findByTextContent",
}

export const scraperSelectorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SelectorType.Query),
    query: z.string(),
  }),
  z.object({
    type: z.literal(SelectorType.FindByTextContent),
    text: z.union([z.string(), z.instanceof(RegExp)]),
    tagName: tagNameSchema.optional(),
  }),
])

export type ScraperSelector = z.infer<typeof scraperSelectorSchema>
