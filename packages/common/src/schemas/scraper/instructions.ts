import { z } from "zod"
import { type ScraperCondition, scraperConditionSchema } from "./condition"
import { type PageAction, pageActionSchema } from "./page-action"
import {
  scraperDataKeySchema,
  scraperValueSchema,
  type ScraperDataKey,
  type ScraperValue,
} from "./value"

export enum ScraperInstructionType {
  /** Used to interact with the page */
  PageAction = "pageAction",

  /** Used to decide whether to perform scraper instructions based on a condition */
  Condition = "condition",

  /** Used to save data to the data bridge */
  SaveData = "saveData",

  /**
   * Used to upsert multiple keys of the same data source\
   * Useful for inserting new database rows that require multiple columns to be set at once\
   * or for updating multiple columns of the same row in a database table
   */
  SaveDataBatch = "saveDataBatch",

  /** Used to delete data from the data bridge */
  DeleteData = "deleteData",

  /** Used to mark a point in the scraper execution for controlling its flow */
  Marker = "marker",

  /**
   * Used to jump to a specific marker in the scraper execution flow\
   * If jump is performed in the backward direction to the same level* of executing instructions, it will create a loop that must be eventually escaped to avoid infinite recursion
   *
   * \* list of instructions in `then` and `else` branches of a condition instruction runs in next (level + 1) level of execution
   */
  Jump = "jump",
}

type ScraperInstructionRecursive =
  | { type: ScraperInstructionType.PageAction; action: PageAction }
  | {
      type: ScraperInstructionType.Condition
      if: ScraperCondition
      then: ScraperInstructionsRecursive
      else?: ScraperInstructionsRecursive
    }
  | {
      type: ScraperInstructionType.SaveData
      dataKey: ScraperDataKey
      value: ScraperValue
    }
  | {
      type: ScraperInstructionType.SaveDataBatch
      dataSourceName: string
      items: Array<{
        columnName: string
        value: ScraperValue
      }>
    }
  | { type: ScraperInstructionType.DeleteData; dataSourceName: string }
  | { type: ScraperInstructionType.Marker; name: string }
  | { type: ScraperInstructionType.Jump; markerName: string }
//TODO: add "show notification" instruction

type ScraperInstructionsRecursive = Array<ScraperInstructionRecursive>

export const scraperInstructionsSchema: z.ZodType<ScraperInstructionsRecursive> =
  z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal(ScraperInstructionType.PageAction),
        action: pageActionSchema,
      }),
      z.object({
        type: z.literal(ScraperInstructionType.Condition),
        if: scraperConditionSchema,
        then: z.lazy(() => scraperInstructionsSchema),
        else: z.lazy(() => scraperInstructionsSchema).optional(),
      }),

      z.object({
        type: z.literal(ScraperInstructionType.SaveData),
        dataKey: scraperDataKeySchema,
        value: scraperValueSchema,
      }),
      z.object({
        type: z.literal(ScraperInstructionType.SaveDataBatch),
        dataSourceName: z.string().min(1, "Data source name must not be empty"),
        items: z.array(
          z.object({
            columnName: z.string().min(1, "Column name must not be empty"),
            value: scraperValueSchema,
          }),
        ),
      }),
      z.object({
        type: z.literal(ScraperInstructionType.DeleteData),
        dataSourceName: z.string().min(1, "Data source name must not be empty"),
      }),

      z.object({
        type: z.literal(ScraperInstructionType.Marker),
        name: z.string().min(1, "Marker name must not be empty"),
      }),
      z.object({
        type: z.literal(ScraperInstructionType.Jump),
        markerName: z.string().min(1, "Marker name must not be empty"),
      }),
    ]),
  )

export type ScraperInstructions = z.infer<typeof scraperInstructionsSchema>
