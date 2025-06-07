import { z } from "zod"
import { whereSchema } from "../common/where"

export const scraperDataSourceSchema = z.object({
  dataStoreTableName: z.string(),
  sourceAlias: z.string().min(1, "Source alias is required"),
  whereSchema: whereSchema.nullable(),
})

export type ScraperDataSource = z.infer<typeof scraperDataSourceSchema>

export const dataSourceNameSchema = z
  .string()
  .min(1, "Data source name must not be empty")
