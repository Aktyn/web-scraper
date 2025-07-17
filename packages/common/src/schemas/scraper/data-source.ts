import { z } from "zod"
import { whereSchema } from "../common/where"

export const scraperDataSourceSchema = z.object({
  dataStoreTableName: z.string(),
  sourceAlias: z.string().min(1, { error: "Source alias is required" }),
  whereSchema: whereSchema.nullable(),
})

export type ScraperDataSource = z.infer<typeof scraperDataSourceSchema>

export const dataSourceNameSchema = z
  .string()
  .min(1, { error: "Data source name must not be empty" })
