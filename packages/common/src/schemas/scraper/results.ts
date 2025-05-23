import { z } from "zod"
import { scraperConditionSchema, ScraperInstructionType } from "./instructions"
import { pageActionSchema } from "./page-action"

const instructionInfoSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(ScraperInstructionType.PageAction), action: pageActionSchema }),
  z.object({
    type: z.literal(ScraperInstructionType.Condition),
    condition: scraperConditionSchema,
    isMet: z.boolean(),
  }),
  z.object({ type: z.literal(ScraperInstructionType.Marker), name: z.string() }),
  z.object({ type: z.literal(ScraperInstructionType.Jump), markerName: z.string() }),
])

export type ScraperInstructionInfo = z.infer<typeof instructionInfoSchema>

export enum ScraperInstructionsExecutionInfoType {
  Instruction = "instruction",
  ExternalDataOperation = "external-data-operation",
  Success = "success",
  Error = "error",
}

export const scraperInstructionsExecutionInfoSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Instruction),
      instructionInfo: instructionInfoSchema,
      url: z.union([z.string(), z.object({ from: z.string(), to: z.string() })]),
      duration: z.number(),
    }),
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.ExternalDataOperation),
      operation: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("get"),
          key: z.string(),
          returnedValue: z.string().nullable(),
        }),
        z.object({
          type: z.literal("set"),
          key: z.string(),
        }),
        z.object({
          type: z.literal("delete"),
          key: z.string(),
        }),
      ]),
    }),
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Success),
      summary: z.object({
        duration: z.number(),
      }),
    }),
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Error),
      errorMessage: z.string(),
    }),
  ]),
)

export type ScraperInstructionsExecutionInfo = z.infer<
  typeof scraperInstructionsExecutionInfoSchema
>
