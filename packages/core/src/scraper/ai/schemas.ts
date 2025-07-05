import { z } from "zod"

// ----- Localization schemas -----

export const coordinatesSchema = z.object({
  action: z.literal("click"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge"),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge"),
})

// ----- Navigation schemas -----

export enum NavigationActionType {
  ClickElement = "click_element",
  TypeText = "type_text",
  Scroll = "scroll",
  Refresh = "refresh",
  Goto = "goto",
  Answer = "answer",
}

const clickElementActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.ClickElement)
    .describe("Click at absolute coordinates in a web page"),
  // element: z.string().describe("Text description of the element"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge"),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge"),
})

const typeTextActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.TypeText)
    .describe(
      "Use keyboard to write some text in a web element; should be preceded by a click action",
    ),
  text: z.string().describe("Text to write"),
  // element: z.string().describe("Text description of the element"),
  pressEnter: z
    .boolean()
    .optional()
    .describe("Whether to press enter after typing"),
})

const scrollActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.Scroll)
    .describe("Scroll the page or a specific element"),
  direction: z
    .enum(["down", "up", "left", "right"])
    .describe("The direction to scroll in"),
})

const refreshActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.Refresh)
    .describe("Refresh the current page"),
})

const gotoActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.Goto)
    .describe("Navigate to a particular URL"),
  url: z.string().describe("URL starting with http:// or https://"),
})

const answerActionSchema = z.object({
  actionType: z
    .literal(NavigationActionType.Answer)
    .describe("Answer a question"),
  content: z.string().describe("The answer content"),
})

const pageActionSchema = z.discriminatedUnion("actionType", [
  clickElementActionSchema,
  typeTextActionSchema,
  scrollActionSchema,
  refreshActionSchema,
  answerActionSchema,
  gotoActionSchema,
])

export type AutonomousAgentAction = z.infer<typeof pageActionSchema>

export const navigationStepSchema = z.object({
  note: z
    .string()
    .default("")
    .describe(
      "Task-relevant information extracted from the previous observation. Keep empty if no new info.",
    ),
  thought: z.string().describe("Reasoning about current step"),
  actions: z
    .array(pageActionSchema)
    .describe("Series of page actions to perform"),
})

export type NavigationStep = z.infer<typeof navigationStepSchema>
