import type { ActionsHistory } from "./autonomous-agent"
import { AgentActionType, type AgentActions } from "./schema"

export function summarizeAgentActions(actions: ActionsHistory) {
  const partialSummaries: string[] = []

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    const summary = summarizeAction(action)

    if (action.feedback.length > 0) {
      const formattedFeedback = action.feedback
        .map((f) => `  - ${f}`)
        .join("\n")

      partialSummaries.push(`${i + 1}. ${summary}\n${formattedFeedback}`)
    } else {
      partialSummaries.push(`${i + 1}. ${summary}`)
    }
  }

  return partialSummaries.join("\n")
}

function summarizeAction(action: AgentActions[number]) {
  switch (action.actionType) {
    case AgentActionType.AddNote:
      return `Added a note: ${action.content}`
    case AgentActionType.Click:
      return `Clicked on element: "${action.elementDescription}"`
    case AgentActionType.Write: {
      const pressEnterString = action.pressEnter ? " and pressed Enter" : ""
      return `Wrote "${action.text}" in element: "${action.elementDescription}"${pressEnterString}`
    }
    case AgentActionType.Scroll:
      return `Scrolled page ${action.direction}`
    case AgentActionType.Navigate:
      return `Navigated to ${action.url}`
    case AgentActionType.FetchFromStorage:
      return `Fetched value from storage with key: "${action.storageKey}"`
    case AgentActionType.SaveToStorage: {
      const keys = action.items.map(({ storageKey }) => storageKey).join(", ")
      return `Saved to storage items with keys: ${keys}`
    }
    case AgentActionType.ShowNotification:
      return `Showed desktop notification: "${action.content}"`
    case AgentActionType.Abort:
      return `Aborted task. Reason: ${action.reason}`
    case AgentActionType.Finish:
      return `Finished the task: ${action.finalNotes}`
  }
}
