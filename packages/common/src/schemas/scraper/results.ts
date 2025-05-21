import { z } from "zod"
import { pageActionSchema, scraperConditionSchema, ScraperInstructionType } from "./instructions"

export enum ScraperInstructionsExecutionInfoType {
  Instruction = "instruction",
  Success = "success",
  Error = "error",
}

export const scraperInstructionsExecutionInfoSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Instruction),
      instructionInfo: z.discriminatedUnion("type", [
        z.object({ type: z.literal(ScraperInstructionType.PageAction), action: pageActionSchema }),
        z.object({
          type: z.literal(ScraperInstructionType.Condition),
          condition: scraperConditionSchema,
          isMet: z.boolean(),
        }),
        z.object({ type: z.literal(ScraperInstructionType.Marker), name: z.string() }),
        z.object({ type: z.literal(ScraperInstructionType.Jump), markerName: z.string() }),
      ]),

      // scraperInstructionsSchema.transform((instructions) => instructions[0].type),
      // result: z.any(), //TODO
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
