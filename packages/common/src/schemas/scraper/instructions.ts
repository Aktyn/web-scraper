import { z } from "zod"
import { type PageAction, pageActionSchema } from "./page-action"
import { scraperSelectorSchema } from "./selector"

export enum ConditionType {
  IsVisible = "isVisible",
  //TODO: data based conditions
}

export const scraperConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ConditionType.IsVisible),
    selector: scraperSelectorSchema,
  }),
])

export type ScraperCondition = z.infer<typeof scraperConditionSchema>

export enum ScraperInstructionType {
  /** Used to interact with the page */
  PageAction = "pageAction",

  /** Used to decide whether to perform a page action based on a condition */
  Condition = "condition",

  /** Used to mark a point in the scraper for controlling instructions execution flow */
  Marker = "marker",

  /** Used to jump to a specific marker in the instructions execution flow */
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
  | { type: ScraperInstructionType.Marker; name: string }
  | { type: ScraperInstructionType.Jump; markerName: string }

type ScraperInstructionsRecursive = Array<ScraperInstructionRecursive>

export const scraperInstructionsSchema: z.ZodType<ScraperInstructionsRecursive> = z.lazy(() =>
  z.array(
    z.discriminatedUnion("type", [
      z.object({ type: z.literal(ScraperInstructionType.PageAction), action: pageActionSchema }),

      z.object({
        type: z.literal(ScraperInstructionType.Condition),
        if: scraperConditionSchema,
        then: scraperInstructionsSchema,
        else: scraperInstructionsSchema.optional(),
      }),

      z.object({ type: z.literal(ScraperInstructionType.Marker), name: z.string() }),

      z.object({ type: z.literal(ScraperInstructionType.Jump), markerName: z.string() }),
    ]),
  ),
)

export type ScraperInstructions = z.infer<typeof scraperInstructionsSchema>
