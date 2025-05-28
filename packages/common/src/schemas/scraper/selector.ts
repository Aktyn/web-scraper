import { z } from "zod"
import { serializableRegex, tagNameSchema } from "./helpers"

export enum ElementSelectorType {
  Query = "query",
  FindByTextContent = "findByTextContent",
}

export const scraperElementSelectorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ElementSelectorType.Query),
    query: z.string(),
  }),
  z.object({
    type: z.literal(ElementSelectorType.FindByTextContent),
    text: z.union([z.string(), serializableRegex]),
    tagName: tagNameSchema.optional(),
    args: z.record(z.string(), z.union([z.string(), serializableRegex])).optional(),
  }),
])

export type ScraperElementSelector = z.infer<typeof scraperElementSelectorSchema>
