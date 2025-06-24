import z from "zod"
import { scraperElementSelectorsSchema } from "./selectors"
import { evaluatorSchema, scraperValueSchema } from "./value"
import { durationSchema } from "./common"

export enum PageActionType {
  Wait = "wait", //TODO: wait should be moved to instruction level since it's not a page dependent
  Navigate = "navigate",

  Click = "click",
  Type = "type",

  ScrollToTop = "scroll-to-top",
  ScrollToBottom = "scroll-to-bottom",
  //TODO: scroll to element

  Evaluate = "evaluate",
}

export const pageActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(PageActionType.Wait),
    duration: durationSchema,
  }),
  z.object({
    type: z.literal(PageActionType.Navigate),
    url: z.string().url("Invalid URL"),
  }),

  z.object({
    type: z.literal(PageActionType.Click),
    selectors: scraperElementSelectorsSchema,
    waitForNavigation: z.boolean().optional(),
    useGhostCursor: z.boolean().optional(),
  }),
  z.object({
    type: z.literal(PageActionType.Type),
    selectors: scraperElementSelectorsSchema,
    clearBeforeType: z.boolean().optional(),
    value: scraperValueSchema,
    pressEnter: z.boolean().optional(),
    waitForNavigation: z.boolean().optional(),
  }),

  z.object({
    type: z.literal(PageActionType.ScrollToTop),
  }),
  z.object({
    type: z.literal(PageActionType.ScrollToBottom),
  }),

  z.object({
    type: z.literal(PageActionType.Evaluate),
    evaluator: evaluatorSchema,
  }),
])

export type PageAction = z.infer<typeof pageActionSchema>
