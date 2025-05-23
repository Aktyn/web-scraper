import z from "zod"
import { scraperElementSelectorSchema } from "./selector"

export enum ScraperValueType {
  Literal = "literal",
  CurrentTimestamp = "currentTimestamp",

  ExternalData = "externalData",

  ElementTextContent = "elementTextContent",
  ElementAttribute = "elementAttribute",
}

export const scraperValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperValueType.Literal),
    value: z.string(),
  }),

  z.object({
    type: z.literal(ScraperValueType.CurrentTimestamp),
  }),

  z.object({
    type: z.literal(ScraperValueType.ExternalData),
    dataKey: z.string(),
    defaultValue: z.string().optional(),
  }),

  z.object({
    type: z.literal(ScraperValueType.ElementTextContent),
    selector: scraperElementSelectorSchema,
  }),
  z.object({
    type: z.literal(ScraperValueType.ElementAttribute),
    selector: scraperElementSelectorSchema,
    attributeName: z.string(),
  }),
])

export type ScraperValue = z.infer<typeof scraperValueSchema>
