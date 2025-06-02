import { z } from "zod"
import { type ScraperCondition, scraperConditionSchema } from "./condition"
import { type PageAction, pageActionSchema } from "./page-action"
import type { ScraperDataKey, ScraperValue } from "./value"

export enum ScraperInstructionType {
  /** Used to interact with the page */
  PageAction = "pageAction",

  /** Used to decide whether to perform scraper instructions based on a condition */
  Condition = "condition",

  /** Used to save data to the data bridge */
  SaveData = "saveData",

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

// Helper TypeScript types for defining the recursive Zod schema
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
  | { type: ScraperInstructionType.DeleteData; dataKey: ScraperDataKey }
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
        type: z.literal(ScraperInstructionType.Marker),
        name: z.string(),
      }),

      z.object({
        type: z.literal(ScraperInstructionType.Jump),
        markerName: z.string(),
      }),
    ]),
  )

export type ScraperInstructions = z.infer<typeof scraperInstructionsSchema>
