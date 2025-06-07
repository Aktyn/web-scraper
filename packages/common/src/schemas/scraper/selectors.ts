import { z } from "zod"
import { unique } from "../../utils"
import { serializableRegex, tagNameSchema } from "./helpers"

export enum ElementSelectorType {
  Query = "query",
  TextContent = "textContent",
  TagName = "tagName",
  Attributes = "attributes",
}

//TODO: turn it into an array of selectors; it will work as list of [and] conditions
export const scraperElementSelectorsSchema = z
  .array(
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
          .refine(
            (val) => Object.keys(val).length > 0,
            "At least one attribute is required",
          ),
      }),
    ]),
  )
  .min(1, "At least one selector is required")
  .refine((selectors) => {
    return (
      unique(selectors.map((selector) => selector.type)).length ===
      selectors.length
    )
  }, "There cannot be more than one selector of the same type")

export type ScraperElementSelectors = z.infer<
  typeof scraperElementSelectorsSchema
>
