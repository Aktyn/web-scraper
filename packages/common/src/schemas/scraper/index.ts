import z from "zod"
import { whereSchema } from "../common/where"
import { scraperInstructionsSchema } from "./instructions"

export * from "./condition"
export * from "./helpers"
export * from "./instructions"
export * from "./page-action"
export * from "./results"
export * from "./selector"
export * from "./value"

export const scraperDataSourceSchema = z.object({
  dataStoreTableName: z.string(),
  sourceAlias: z.string().min(1, "Source alias is required"),
  whereSchema: whereSchema.nullable(),
})

export type ScraperDataSource = z.infer<typeof scraperDataSourceSchema>

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
