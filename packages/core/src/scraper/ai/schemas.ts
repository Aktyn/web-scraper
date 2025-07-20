import { z } from "zod"
import type { Resolution } from "./image-processing"

// ----- Localization schemas -----

export function getCoordinatesSchema(resolution: Resolution) {
  return z.object({
    x: z
      .int()
      .min(0)
      .max(resolution.width)
      .describe("The x coordinate, number of pixels from the left edge"),
    y: z
      .int()
      .min(0)
      .max(resolution.height)
      .describe("The y coordinate, number of pixels from the top edge"),
  })
}

// ----- Navigation schemas -----

export enum NavigationActionType {
  ClickElement = "click_element",
  TypeText = "type_text",
  Scroll = "scroll",
  Refresh = "refresh",
  Goto = "goto",
  FetchFromStorage = "fetch_from_storage",
  SaveToStorage = "save_to_storage",
  ShowNotification = "show_notification",
  Answer = "answer",
}

const actions = [
  z.object({
    actionType: z
      .literal(NavigationActionType.ClickElement)
      .describe("Click at absolute coordinates in a web page"),
    x: z
      .int()
      .min(0)
      .max(1316) //TODO: get this from the resized resolution
      .describe("The x coordinate, number of pixels from the left edge"),
    y: z
      .int()
      .min(0)
      .max(728) //TODO: get this from the resized resolution
      .describe("The y coordinate, number of pixels from the top edge"),
  }),
  z.object({
    actionType: z
      .literal(NavigationActionType.TypeText)
      .describe(
        "Use keyboard to write some text in a web element; should be preceded by a click action",
      ),
    text: z.string().describe("Text to write"),
    pressEnter: z
      .boolean()
      .optional()
      .describe("Whether to press enter after typing"),
  }),

  z.object({
    actionType: z
      .literal(NavigationActionType.Scroll)
      .describe("Scroll the page or a specific element"),
    direction: z
      .enum(["down", "up", "left", "right"])
      .describe("The direction to scroll in"),
  }),

  z.object({
    actionType: z
      .literal(NavigationActionType.Refresh)
      .describe("Refresh the current page"),
  }),
  z.object({
    actionType: z
      .literal(NavigationActionType.Goto)
      .describe("Navigate to a particular URL"),
    url: z.string().describe("URL starting with http:// or https://"),
  }),

  z.object({
    actionType: z
      .literal(NavigationActionType.FetchFromStorage)
      .describe("Fetch data from storage"),
    storageKey: z.string().describe("Key pointing to a storage item"),
  }),
  z.object({
    actionType: z
      .literal(NavigationActionType.SaveToStorage)
      .describe("Save data in storage"),
    items: z
      .array(
        z.object({
          storageKey: z.string().describe("Key pointing to a storage item"),
          value: z.union([z.string(), z.number(), z.null()]),
        }),
      )
      .describe("List of key-value pairs to save"),
  }),

  z.object({
    actionType: z
      .literal(NavigationActionType.ShowNotification)
      .describe("Show desktop notification"),
    content: z.string().describe("Content to display in the notification"),
  }),
  z.object({
    actionType: z
      .literal(NavigationActionType.Answer)
      .describe("Answer a question"),
    content: z.string().describe("The answer content"),
  }),
] as const

export function getNavigationStepSchema(includeStorageActions = false) {
  const filteredActions = includeStorageActions
    ? actions
    : (actions.filter((action) =>
        [
          NavigationActionType.FetchFromStorage,
          NavigationActionType.SaveToStorage,
        ].includes(action.shape.actionType.value),
      ) as unknown as typeof actions)

  return z.object({
    note: z
      .string()
      .default("")
      .describe(
        "Task-relevant information extracted from the previous observation. Keep empty if no new info.",
      ),
    thought: z.string().describe("Reasoning about current step"),
    actions: z
      .array(z.discriminatedUnion("actionType", filteredActions))
      .describe("Series of page actions to perform"),
  })
}
export type NavigationStep = z.infer<ReturnType<typeof getNavigationStepSchema>>
