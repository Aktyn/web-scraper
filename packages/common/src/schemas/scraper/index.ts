import z from "zod"
import { scraperDataSourceSchema } from "./data-source"
import { scraperInstructionsSchema } from "./instructions"

export const scraperSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Scraper name is required"),
  description: z.string().nullable(),
  instructions: scraperInstructionsSchema,
  userDataDirectory: z.string().nullable(),
  dataSources: z.array(scraperDataSourceSchema),
})

export type ScraperType = z.infer<typeof scraperSchema>

export const createScraperSchema = scraperSchema.omit({ id: true })

export type CreateScraper = z.infer<typeof createScraperSchema>

export const updateScraperSchema = createScraperSchema

export type UpdateScraper = z.infer<typeof updateScraperSchema>

export const paramsWithScraperIdSchema = z.object({
  id: z.coerce.number(),
})

export * from "./common"
export * from "./condition"
export * from "./data-source"
export * from "./execution"
export * from "./helpers"
export * from "./instructions"
export * from "./page-action"
export * from "./results"
export * from "./selectors"
export * from "./system-action"
export * from "./value"
