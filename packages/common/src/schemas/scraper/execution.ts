import { z } from "zod"
import { scraperInstructionsSchema } from "./instructions"
import { scraperInstructionsExecutionInfoSchema } from "./results"
import { ScraperState } from "./common"
import { apiPaginationQuerySchema } from "../common"

export enum ScraperEventType {
  StateChange = "stateChange",
  ExecutionStarted = "executionStarted",
  ExecutionUpdate = "executionUpdate",
  ExecutingInstruction = "executingInstruction",
  ExecutionFinished = "executionFinished",
  ExecutionError = "executionError",
}

const scraperStateChangeEventSchema = z.object({
  type: z.literal(ScraperEventType.StateChange),
  state: z.nativeEnum(ScraperState),
  previousState: z.nativeEnum(ScraperState),
})

const scraperExecutionStartedEventSchema = z.object({
  type: z.literal(ScraperEventType.ExecutionStarted),
})

const scraperExecutionUpdateEventSchema = z.object({
  type: z.literal(ScraperEventType.ExecutionUpdate),
  update: scraperInstructionsExecutionInfoSchema.element,
})

const scraperExecutingInstructionEventSchema = z.object({
  type: z.literal(ScraperEventType.ExecutingInstruction),
  instruction: scraperInstructionsSchema.element,
})

const scraperExecutionFinishedEventSchema = z.object({
  type: z.literal(ScraperEventType.ExecutionFinished),
  executionInfo: scraperInstructionsExecutionInfoSchema,
})

const scraperExecutionErrorEventSchema = z.object({
  type: z.literal(ScraperEventType.ExecutionError),
  error: z.string(),
  executionInfo: scraperInstructionsExecutionInfoSchema.nullable(),
})

export const scraperEventSchema: z.ZodDiscriminatedUnion<
  "type",
  [
    typeof scraperStateChangeEventSchema,
    typeof scraperExecutionStartedEventSchema,
    typeof scraperExecutionUpdateEventSchema,
    typeof scraperExecutingInstructionEventSchema,
    typeof scraperExecutionFinishedEventSchema,
    typeof scraperExecutionErrorEventSchema,
  ]
> = z.discriminatedUnion("type", [
  scraperStateChangeEventSchema,
  scraperExecutionStartedEventSchema,
  scraperExecutionUpdateEventSchema,
  scraperExecutingInstructionEventSchema,
  scraperExecutionFinishedEventSchema,
  scraperExecutionErrorEventSchema,
])

export type ScraperEvent = z.infer<typeof scraperEventSchema>

export const scraperExecutionStatusSchema = z.object({
  state: z.nativeEnum(ScraperState),
  executionInfo: scraperInstructionsExecutionInfoSchema,
  currentlyExecutingInstruction: scraperInstructionsSchema.element.nullable(),
})

export type ScraperExecutionStatus = z.infer<
  typeof scraperExecutionStatusSchema
>

export const executingScraperInfoSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
})

export type ExecutingScraperInfo = z.infer<typeof executingScraperInfoSchema>

export const listScraperExecutionsQuerySchema = apiPaginationQuerySchema.extend(
  {
    id: z.coerce.number().int().min(1).optional(),
  },
)

export type ListScraperExecutionsQuery = z.infer<
  typeof listScraperExecutionsQuerySchema
>
