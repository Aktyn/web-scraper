import { z } from "zod"
import { executionIteratorSchema } from "../iterator"
import { scraperConditionSchema } from "./condition"
import { ScraperInstructionType } from "./instructions"
import { pageActionSchema } from "./page-action"
import { systemActionSchema } from "./system-action"
import { scraperDataKeySchema, scraperValueSchema } from "./value"

const instructionInfoSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ScraperInstructionType.PageAction),
    pageIndex: z.number(),
    pageUrl: z.union([
      z.string(),
      z.object({ from: z.string(), to: z.string() }),
    ]),
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

  z.object({
    type: z.literal(ScraperInstructionType.SystemAction),
    systemAction: systemActionSchema,
  }),
])

export type ScraperInstructionInfo = z.infer<typeof instructionInfoSchema>

export enum ScraperInstructionsExecutionInfoType {
  Instruction = "instruction",
  ExternalDataOperation = "external-data-operation",
  PageOpened = "page-opened",
  //TODO: allow user to close pages to reduce clutter and improve performance
  Success = "success",
  Error = "error",
}

const valueSchema = z.union([z.string(), z.number(), z.null()])

const summarySchema = z.object({
  duration: z.number(),
})

export const scraperInstructionsExecutionInfoSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Instruction),
      instructionInfo: instructionInfoSchema,
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
      type: z.literal(ScraperInstructionsExecutionInfoType.PageOpened),
      pageIndex: z.number(),
      portalUrl: z.string().optional(),
    }),

    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Success),
      summary: summarySchema,
    }),

    z.object({
      type: z.literal(ScraperInstructionsExecutionInfoType.Error),
      errorMessage: z.string(),
      summary: summarySchema,
    }),
  ]),
)

export type ScraperInstructionsExecutionInfo = z.infer<
  typeof scraperInstructionsExecutionInfoSchema
>

export const scraperExecutionInfoSchema = z.object({
  id: z.number(),
  scraperId: z.number(),
  iterator: executionIteratorSchema
    ? executionIteratorSchema.nullable()
    : executionIteratorSchema,
  createdAt: z.number(),
  iterations: z.array(
    z.object({
      iteration: z.number().min(1),
      executionInfo: scraperInstructionsExecutionInfoSchema,
      finishedAt: z.number(),
    }),
  ),
})

export type ScraperExecutionInfo = z.infer<typeof scraperExecutionInfoSchema>
