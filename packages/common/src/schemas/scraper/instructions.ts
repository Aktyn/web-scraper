import { z } from "zod"
import { tagNameSchema } from "./helpers"

export enum SelectorType {
  Query = "query",
  FindByTextContent = "findByTextContent",
}

const scraperSelectorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SelectorType.Query),
    query: z.string(),
  }),
  z.object({
    type: z.literal(SelectorType.FindByTextContent),
    text: z.union([z.string(), z.instanceof(RegExp)]),
    tagName: tagNameSchema.optional(),
  }),
])

export type ScraperSelector = z.infer<typeof scraperSelectorSchema>

export enum PageActionType {
  Wait = "wait",
  Navigate = "navigate",
  Click = "click",
  Type = "type",
}

export const pageActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(PageActionType.Wait),
    duration: z.number(),
  }),
  z.object({
    type: z.literal(PageActionType.Navigate),
    url: z.string(),
  }),
  z.object({
    type: z.literal(PageActionType.Click),
    selector: scraperSelectorSchema,
  }),
  z.object({
    type: z.literal(PageActionType.Type),
    selector: scraperSelectorSchema,
    text: z.string(),
    clearBeforeType: z.boolean().optional(),
  }),
])

export type PageAction = z.infer<typeof pageActionSchema>

export enum ConditionType {
  IsVisible = "isVisible",
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
