import z from "zod"
import { scraperDataSourceSchema } from "./data-source"
import { scraperInstructionsSchema } from "./instructions"
import { apiPaginationQuerySchema, timestampSchema } from "../common"

export const scraperSchema = z.object({
  id: z.number().int().min(1),
  name: z.string().min(1, { error: "Scraper name is required" }),
  description: z.string().nullable(),
  instructions: scraperInstructionsSchema,
  userDataDirectory: z.string().nullable(),
  dataSources: z.array(scraperDataSourceSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export type ScraperType = z.infer<typeof scraperSchema>

export const upsertScraperSchema = scraperSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type UpsertScraper = z.infer<typeof upsertScraperSchema>

export const paramsWithScraperIdSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export const scraperQuerySchema = apiPaginationQuerySchema.extend({
  name: z.string().optional(),
})

export type ScraperQuery = z.infer<typeof scraperQuerySchema>

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
