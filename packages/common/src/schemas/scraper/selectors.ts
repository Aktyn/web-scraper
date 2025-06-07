import { z } from "zod"
import { serializableRegex, tagNameSchema } from "./helpers"

export enum ElementSelectorType {
  Query = "query",
  TextContent = "textContent",
  TagName = "tagName",
  Attributes = "attributes",
}

//TODO: turn it into an array of selectors; it will work as list of [and] conditions
export const scraperElementSelectorsSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(ElementSelectorType.Query),
      query: z.string(),
    }),
    z.object({
      type: z.literal(ElementSelectorType.TextContent),
      text: z.union([z.string(), serializableRegex]),
    }),
    z.object({
      type: z.literal(ElementSelectorType.TagName),
      tagName: tagNameSchema,
    }),
    z.object({
      type: z.literal(ElementSelectorType.Attributes),
      attributes: z
        .record(z.string(), z.union([z.string(), serializableRegex]))
        .optional(),
    }),
  ]),
)

export type ScraperElementSelectors = z.infer<
  typeof scraperElementSelectorsSchema
>
