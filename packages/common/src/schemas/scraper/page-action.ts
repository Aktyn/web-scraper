import z from "zod"
import { scraperElementSelectorsSchema } from "./selectors"
import { evaluatorSchema, scraperValueSchema } from "./value"
import { durationSchema } from "../common"

export enum PageActionType {
  Wait = "wait", //TODO: wait should be moved to instruction level since it's not a page dependent
  Navigate = "navigate",

  Click = "click",
  /**
   * This action is used to localize element described by a prompt and click on it.\
   * AI will be used to generate coordinates based on the given prompt and screenshot of the current viewport.\
   * Example prompt: "Click on Download section in the navigation bar"
   */
  SmartClick = "smart-click",
  Type = "type",

  ScrollToBottom = "scroll-to-bottom",
  ScrollToTop = "scroll-to-top",
  ScrollToElement = "scroll-to-element",

  Evaluate = "evaluate",

  /**
   * This action is used to let AI take control over single page in order to perform a given task.\
   * Task should be precise and specific and contain all necessary information to perform the task.\
   * Example prompt: "Star repository named "Web-Scraper". The author is Aktyn."\
   * AI is able to perform any user-like action on the page\
   * If Ollama runs locally, this action can be really time consuming.
   */
  RunAutonomousAgent = "run-autonomous-agent",
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
    type: z.literal(PageActionType.SmartClick),
    aiPrompt: z.string().min(1, "AI prompt is required"),
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
    type: z.literal(PageActionType.ScrollToBottom),
  }),
  z.object({
    type: z.literal(PageActionType.ScrollToTop),
  }),
  z.object({
    type: z.literal(PageActionType.ScrollToElement),
    selectors: scraperElementSelectorsSchema,
  }),

  z.object({
    type: z.literal(PageActionType.Evaluate),
    evaluator: evaluatorSchema,
  }),

  z.object({
    type: z.literal(PageActionType.RunAutonomousAgent),
    startUrl: z.string().url("Invalid URL").optional(),
    task: z.string().min(1, "Task description is required"),
    useGhostCursor: z.boolean().optional(),
    maximumSteps: z.number().int().min(1).max(256).optional(),
  }),
])

export type PageAction = z.infer<typeof pageActionSchema>
