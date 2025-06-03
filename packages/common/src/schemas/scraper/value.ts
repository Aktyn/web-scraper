import z from "zod"
import { scraperElementSelectorSchema } from "./selector"

/** DataSourceName.ColumnName where data source name refers to table or view name */
export type ScraperDataKey = `${string}.${string}`

export const scraperDataKeySchema = z.custom<ScraperDataKey>(
  (value) => {
    if (typeof value !== "string") return false
    return /^[^.]+\.[^.]+$/.test(value)
  },
  {
    message:
      "Invalid data key format. Expected format: 'DataSourceName.ColumnName'",
  },
)

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
    dataKey: scraperDataKeySchema,
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
