import { z } from "zod"
import { scraperInstructionsSchema } from "./instructions"
import { scraperInstructionsExecutionInfoSchema } from "./results"
import { ScraperState } from "./common"

export enum ScraperEventType {
  StateChange = "stateChange",
  ExecutionStarted = "executionStarted",
  ExecutionUpdate = "executionUpdate",
  ExecutingInstruction = "executingInstruction",
  ExecutionFinished = "executionFinished",
  ExecutionError = "executionError",
}

export const scraperEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperEventType.StateChange),
    state: z.nativeEnum(ScraperState),
    previousState: z.nativeEnum(ScraperState),
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutionStarted),
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutionUpdate),
    update: scraperInstructionsExecutionInfoSchema.element,
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutingInstruction),
    instruction: scraperInstructionsSchema.element,
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutionFinished),
    executionInfo: scraperInstructionsExecutionInfoSchema,
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutionError),
    error: z.string(),
    executionInfo: scraperInstructionsExecutionInfoSchema.nullable(),
  }),
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
  id: z.number(),
  name: z.string(),
})

export type ExecutingScraperInfo = z.infer<typeof executingScraperInfoSchema>
