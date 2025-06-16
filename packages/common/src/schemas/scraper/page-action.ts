import z from "zod"
import { scraperElementSelectorsSchema } from "./selectors"
import { scraperValueSchema } from "./value"

export enum PageActionType {
  Wait = "wait",
  Navigate = "navigate",
  Click = "click",
  Type = "type",
  ScrollToTop = "scroll-to-top",
  ScrollToBottom = "scroll-to-bottom",
}

export const pageActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(PageActionType.Wait),
    duration: z.number(),
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
  //TODO: scroll to element
])

export type PageAction = z.infer<typeof pageActionSchema>
