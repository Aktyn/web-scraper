import { z } from "zod"

export enum AgentActionType {
  AddNote = "add_note",

  Click = "click",
  Write = "write",
  Scroll = "scroll",
  Navigate = "navigate",

  FetchFromStorage = "fetch_from_storage",
  SaveToStorage = "save_to_storage",

  ShowNotification = "show_notification",

  Abort = "abort",
  Finish = "finish",
}

type AgentSchemaOptions = {
  hasStorageAccess: boolean
}

export function getAgentSchema(options: AgentSchemaOptions) {
  const addNoteAction = z.object({
    actionType: z
      .literal(AgentActionType.AddNote)
      .describe(
        "Add notes to better track your progress on the main task. Use the notes to plan your next steps, save partial answers, remember previous decisions, etc.",
      ),
    content: z.string().describe("Content of the note"),
  })

  const clickAction = z.object({
    actionType: z
      .literal(AgentActionType.Click)
      .describe("Click element on the page"),
    elementDescription: z
      .string()
      .describe("Human readable description of the element"),
  })

  const writeAction = z.object({
    actionType: z
      .literal(AgentActionType.Write)
      .describe("Write text in an element like input or textarea"),
    elementDescription: z
      .string()
      .describe("Human readable description of the element"),
    text: z.string().describe("Text to write"),
    pressEnter: z
      .boolean()
      .optional()
      .describe("Whether to press enter after typing"),
  })

  const scrollAction = z.object({
    actionType: z.literal(AgentActionType.Scroll).describe("Scroll the page"),
    direction: z.enum(["down", "up"]),
  })

  const navigateAction = z.object({
    actionType: z
      .literal(AgentActionType.Navigate)
      .describe("Navigate to different website"),
    url: z.string(),
  })

  const abortAction = z.object({
    actionType: z
      .literal(AgentActionType.Abort)
      .describe("Abort the task and explain why"),
    reason: z.string(),
  })

  const finishAction = z.object({
    actionType: z
      .literal(AgentActionType.Finish)
      .describe("Finish the task and stop execution"),
    finalNotes: z
      .string()
      .optional()
      .describe("Final notes or summary of the completed task"),
  })

  const fetchFromStorageAction = z.object({
    actionType: z
      .literal(AgentActionType.FetchFromStorage)
      .describe("Fetch data from storage"),
    storageKey: z.string().describe("Key pointing to a storage item"),
  })

  const saveToStorageAction = z.object({
    actionType: z
      .literal(AgentActionType.SaveToStorage)
      .describe("Save data in storage"),
    items: z
      .array(
        z.object({
          storageKey: z.string().describe("Key pointing to a storage item"),
          value: z.union([z.string(), z.number(), z.null()]),
        }),
      )
      .describe("List of key-value pairs to save"),
  })

  const showNotificationAction = z.object({
    actionType: z
      .literal(AgentActionType.ShowNotification)
      .describe("Show desktop notification"),
    content: z.string(),
  })

  let actions = [
    addNoteAction,

    clickAction,
    writeAction,
    scrollAction,
    navigateAction,

    fetchFromStorageAction,
    saveToStorageAction,

    showNotificationAction,

    abortAction,
    finishAction,
  ] as const

  if (!options.hasStorageAccess) {
    actions = actions.filter(
      (action) =>
        ![
          AgentActionType.FetchFromStorage,
          AgentActionType.SaveToStorage,
        ].includes(action.shape.actionType.value),
    ) as unknown as typeof actions
  }

  return z.array(z.discriminatedUnion("actionType", actions)).min(1)
}

export type AgentActions = z.infer<ReturnType<typeof getAgentSchema>>
