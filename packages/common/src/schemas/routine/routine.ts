import { z } from "zod"
import { durationSchema, timestampSchema } from "../common"
import { executionIteratorSchema } from "../iterator"

export enum SchedulerType {
  Interval = "interval",
}

export const schedulerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SchedulerType.Interval),
    interval: durationSchema.min(1),
    startAt: timestampSchema,
    endAt: timestampSchema.nullable(),
  }),
])

export type Scheduler = z.infer<typeof schedulerSchema>

export enum RoutineStatus {
  Active = "active",
  Executing = "executing",
  Paused = "paused",
  PausedDueToMaxNumberOfFailedExecutions = "pausedDueToMaxNumberOfFailedExecutions",
}

export const routineSchema = z.object({
  id: z.number().int().min(1),
  scraperId: z.number().int().min(1),
  scraperName: z.string().min(1),
  iterator: executionIteratorSchema.nullable(),
  status: z.nativeEnum(RoutineStatus),
  description: z.string().nullable(),
  scheduler: schedulerSchema,
  previousExecutionsCount: z.number().int().min(0),
  pauseAfterNumberOfFailedExecutions: z.number().int().min(1).nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export type Routine = z.infer<typeof routineSchema>

export const upsertRoutineSchema = routineSchema.omit({
  id: true,
  scraperName: true,
  status: true,
  previousExecutionsCount: true,
  createdAt: true,
  updatedAt: true,
})

export type UpsertRoutine = z.infer<typeof upsertRoutineSchema>
