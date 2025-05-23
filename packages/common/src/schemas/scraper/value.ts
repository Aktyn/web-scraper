import z from "zod"

export enum ScraperValueType {
  Literal = "literal",
  ExternalData = "externalData",
}

export const scraperValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperValueType.Literal),
    value: z.string(),
  }),

  // Should throw error if there is no default value and the value is not returned
  z.object({
    type: z.literal(ScraperValueType.ExternalData),
    key: z.string(),
    defaultValue: z.string().optional(),
  }),
])

export type ScraperValue = z.infer<typeof scraperValueSchema>
