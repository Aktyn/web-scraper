import { z } from "zod"
import { timestampSchema } from "../common"
import { executionIteratorSchema } from "../iterator"

export enum ScheduledScraperExecutionStatus {
  Pending = "pending",
  WaitingInQueue = "waitingInQueue",
  Running = "running",
}

export const scheduledScraperExecutionSchema = z.object({
  scraperId: z.number().int().min(1),
  scraperName: z.string().min(1),
  iterator: executionIteratorSchema.nullable(),
  willExecuteAt: timestampSchema,
  status: z.nativeEnum(ScheduledScraperExecutionStatus),
})

export type ScheduledScraperExecution = z.infer<
  typeof scheduledScraperExecutionSchema
>
