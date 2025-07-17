import z from "zod"
import { scraperElementSelectorsSchema } from "./selectors"
import { pageIndexSchema } from "./common"

/** DataSourceName.ColumnName where data source name refers to table or view name or its alias */
export type ScraperDataKey = `${string}.${string}`

export const scraperDataKeySchema = z.custom<ScraperDataKey>(
  (value) => {
    if (typeof value !== "string") return false
    return /^[^.]+\.[^.]+$/.test(value)
  },
  {
    error:
      "Invalid data key format. Expected format: 'DataSourceName.ColumnName'",
  },
)

export enum ScraperValueType {
  Literal = "literal",

  Null = "null",
  CurrentTimestamp = "currentTimestamp",

  ExternalData = "externalData",

  ElementTextContent = "elementTextContent",
  ElementAttribute = "elementAttribute",

  //TODO: Evaluate which returns value from executing js code in page context
}

export const scraperValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperValueType.Literal),
    value: z.string(),
  }),

  z.object({
    type: z.literal(ScraperValueType.Null),
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
    pageIndex: pageIndexSchema,
    selectors: scraperElementSelectorsSchema,
  }),
  z.object({
    type: z.literal(ScraperValueType.ElementAttribute),
    pageIndex: pageIndexSchema,
    selectors: scraperElementSelectorsSchema,
    attributeName: z
      .string()
      .min(1, { error: "Attribute name must not be empty" }),
  }),
])

export type ScraperValue = z.infer<typeof scraperValueSchema>

export const evaluatorSchema: z.ZodType<Evaluator> = z.object({
  code: z.string(),
  arguments: z.lazy(() => z.array(scraperValueSchema).optional()),
})

export type Evaluator = {
  code: string
  arguments?: ScraperValue[]
}
