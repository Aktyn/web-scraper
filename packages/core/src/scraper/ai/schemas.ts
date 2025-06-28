import { z } from "zod"

// ----- Localization schemas -----

export const CoordinatesSchema = z.object({
  action: z.literal("click"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge"),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge."),
})

// ----- Navigation schemas -----

export enum NavigationActionType {
  ClickElement = "click_element",
  WriteElement = "write_element_abs",
  Scroll = "scroll",
  GoBack = "go_back",
  Refresh = "refresh",
  Goto = "goto",
  Wait = "wait",
  Restart = "restart",
  Answer = "answer",
}

const ClickElementActionSchema = z.object({
  action: z
    .literal(NavigationActionType.ClickElement)
    .describe("Click at absolute coordinates of a web element"),
  element: z.string().describe("Text description of the element"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge."),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge."),
})

const WriteElementActionSchema = z.object({
  action: z
    .literal(NavigationActionType.WriteElement)
    .describe("Write content at absolute coordinates of a web page"),
  content: z.string().describe("Content to write"),
  element: z.string().describe("Text description of the element"),
  pressEnter: z
    .boolean()
    .optional()
    .describe("Whether to press enter after writing"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge."),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge."),
})

const ScrollActionSchema = z.object({
  action: z
    .literal(NavigationActionType.Scroll)
    .describe("Scroll the page or a specific element"),
  direction: z
    .enum(["down", "up", "left", "right"])
    .describe("The direction to scroll in"),
})

const GoBackActionSchema = z.object({
  action: z
    .literal(NavigationActionType.GoBack)
    .describe("Navigate to the previous page"),
})

const RefreshActionSchema = z.object({
  action: z
    .literal(NavigationActionType.Refresh)
    .describe("Refresh the current page"),
})

const GotoActionSchema = z.object({
  action: z
    .literal(NavigationActionType.Goto)
    .describe("Goto a particular URL"),
  url: z.string().url().describe("A url starting with http:// or https://"),
})

const WaitActionSchema = z.object({
  action: z
    .literal(NavigationActionType.Wait)
    .describe("Wait for a particular amount of time"),
  seconds: z
    .number()
    .int()
    .min(0)
    .max(60)
    .default(2)
    .describe("The number of seconds to wait"),
})

// const RestartActionSchema = z.object({
//   action: z.literal(NavigationActionType.Restart).describe("Restart the agent"),
// })

const AnswerActionSchema = z.object({
  action: z.literal(NavigationActionType.Answer).describe("Answer a question"),
  content: z.string().describe("The answer content"),
})

const ActionSpaceSchema = z.discriminatedUnion("action", [
  ClickElementActionSchema,
  WriteElementActionSchema,
  ScrollActionSchema,
  GoBackActionSchema,
  RefreshActionSchema,
  WaitActionSchema,
  // RestartActionSchema,
  AnswerActionSchema,
  GotoActionSchema,
])

export const NavigationStepSchema = z.object({
  note: z
    .string()
    .default("")
    .describe(
      "Task-relevant information extracted from the previous observation. Keep empty if no new info.",
    ),
  thought: z.string().describe("Reasoning about next steps (<4 lines)"),
  action: ActionSpaceSchema.describe("Next action to take"),
})

export type NavigationStep = z.infer<typeof NavigationStepSchema>
