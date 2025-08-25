import { describe, it, expect } from "vitest"
import {
  type ActionsHistory,
  tooManyActionRepetitions,
} from "./autonomous-agent"
import { AgentActionType } from "./schema"

const actionA: ActionsHistory[number] = {
  actionType: AgentActionType.Click,
  elementDescription: "Element 1 description",
  feedback: [],
}
const actionB: ActionsHistory[number] = {
  actionType: AgentActionType.Click,
  elementDescription: "Element 2 description",
  feedback: [],
}
const actionC: ActionsHistory[number] = {
  actionType: AgentActionType.Click,
  elementDescription: "Element 3 description",
  feedback: [],
}

describe(tooManyActionRepetitions.name, () => {
  it("should return false if the history is shorter than the maximum repetitions", () => {
    expect(tooManyActionRepetitions([])).toBe(false)
    expect(tooManyActionRepetitions([actionA])).toBe(false)
    expect(tooManyActionRepetitions([actionA, actionA])).toBe(false)
  })

  it("should return true if the same action is repeated three times consecutively", () => {
    expect(tooManyActionRepetitions([actionA, actionA, actionA])).toBe(true)
    expect(tooManyActionRepetitions([actionB, actionA, actionA, actionA])).toBe(
      true,
    )
  })

  it("should return false if there are no consecutive repetitions in the recent history", () => {
    expect(tooManyActionRepetitions([actionA, actionB, actionC])).toBe(false)
    expect(tooManyActionRepetitions([actionA, actionB, actionA])).toBe(false)
  })

  it("should handle a longer history correctly", () => {
    expect(
      tooManyActionRepetitions([actionA, actionB, actionC, actionA, actionB]),
    ).toBe(false)
    expect(
      tooManyActionRepetitions([actionB, actionC, actionA, actionA, actionA]),
    ).toBe(true)
  })
})
