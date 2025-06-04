import { z } from "zod"
import { scraperConditionSchema } from "./condition"
import { ScraperInstructionType } from "./instructions"
import { pageActionSchema } from "./page-action"
import { scraperDataKeySchema, scraperValueSchema } from "./value"

const instructionInfoSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperInstructionType.PageAction),
    action: pageActionSchema,
  }),

  z.object({
    type: z.literal(ScraperInstructionType.Condition),
    condition: scraperConditionSchema,
    isMet: z.boolean(),
  }),

  z.object({
    type: z.literal(ScraperInstructionType.SaveData),
    dataKey: scraperDataKeySchema,
    value: scraperValueSchema,
  }),
  z.object({
    type: z.literal(ScraperInstructionType.SaveDataBatch),
    dataSourceName: z.string(),
    items: z.array(
      z.object({
        columnName: z.string(),
        value: scraperValueSchema,
      }),
    ),
  }),
  z.object({
    type: z.literal(ScraperInstructionType.DeleteData),
    dataSourceName: z.string(),
  }),

  z.object({
    type: z.literal(ScraperInstructionType.Marker),
    name: z.string(),
  }),
  z.object({
    type: z.literal(ScraperInstructionType.Jump),
    markerName: z.string(),
  }),
])

export type ScraperInstructionInfo = z.infer<typeof instructionInfoSchema>

export enum ScraperInstructionsExecutionInfoType {
  Instruction = "instruction",
  ExternalDataOperation = "external-data-operation",
  Success = "success",
  Error = "error",
}

const valueSchema = z.union([z.string(), z.number(), z.null()])

export const scraperInstructionsExecutionInfoSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Instruction),
      instructionInfo: instructionInfoSchema,
      url: z.union([
        z.string(),
        z.object({ from: z.string(), to: z.string() }),
      ]),
      duration: z.number(),
    }),
    z.object({
      type: z.literal(
        ScraperInstructionsExecutionInfoType.ExternalDataOperation,
      ),
      operation: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("get"),
          key: z.string(),
          returnedValue: valueSchema,
        }),
        z.object({
          type: z.literal("set"),
          key: z.string(),
          value: valueSchema,
        }),
        z.object({
          type: z.literal("setMany"),
          dataSourceName: z.string(),
          items: z.array(
            z.object({
              columnName: z.string(),
              value: valueSchema,
            }),
          ),
        }),
        z.object({
          type: z.literal("delete"),
          dataSourceName: z.string(),
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
