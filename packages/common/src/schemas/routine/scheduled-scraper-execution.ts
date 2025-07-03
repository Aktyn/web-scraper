import { z } from "zod"
import { timestampSchema } from "../common"
import { executionIteratorSchema } from "../iterator"

export const scheduledScraperExecutionSchema = z.object({
  routineId: z.number().int().min(1),
  scraperId: z.number().int().min(1),
  scraperName: z.string().min(1),
  iterator: executionIteratorSchema.nullable(),
  nextScheduledExecutionAt: timestampSchema,
})

export type ScheduledScraperExecution = z.infer<
  typeof scheduledScraperExecutionSchema
>
