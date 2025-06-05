import { z } from "zod"
import { scraperInstructionsExecutionInfoSchema } from "./results"

export enum ScraperState {
  /** Pending initial execution */
  Pending = "pending",

  /** Between execution iterations or before clean exit */
  Idle = "idle",

  /** Scraper is currently executing given instructions */
  Executing = "executing",

  /** Scraper has been destroyed, either due to an error, user intervention or it finished all its executions */
  Exited = "exited",

  //TODO: awaiting user action, e.g. captcha
}

export enum ScraperEventType {
  StateChange = "stateChange",
  ExecutionStarted = "executionStarted",
  ExecutionUpdate = "executionUpdate",
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
    type: z.literal(ScraperEventType.ExecutionFinished),
    executionInfo: scraperInstructionsExecutionInfoSchema,
  }),
  z.object({
    type: z.literal(ScraperEventType.ExecutionError),
    error: z.string(),
  }),
])

export type ScraperEvent = z.infer<typeof scraperEventSchema>
