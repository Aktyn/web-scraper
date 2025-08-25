import { describe, expect, it } from "vitest"
import { z } from "zod"
import { AgentActionType } from "../agent/schema"
import { schemaToJson } from "./schema-to-json"

describe(schemaToJson.name, () => {
  const minimalSchema = z
    .array(
      z.discriminatedUnion("actionType", [
        z.object({
          actionType: z
            .literal(AgentActionType.Click)
            .describe("Click element on the page"),
          elementDescription: z
            .string()
            .describe("Description of the element to click"),
        }),
        z.object({
          actionType: z
            .literal(AgentActionType.Finish)
            .describe("Finish the task and stop execution"),
          finalNotes: z
            .string()
            .optional()
            .describe("Final notes or summary of the completed task"),
        }),
      ]),
    )
    .min(1)

  it("should generate JSON schema compatible with ollama structured output", () => {
    const jsonSchema = schemaToJson(minimalSchema)

    expect(jsonSchema).toStrictEqual({
      type: "array",
      items: {
        anyOf: [
          {
            type: "object",
            properties: {
              actionType: {
                description: "Click element on the page",
                type: "string",
                const: "click",
              },
              elementDescription: {
                description: "Description of the element to click",
                type: "string",
              },
            },
            required: ["actionType", "elementDescription"],
          },
          {
            type: "object",
            properties: {
              actionType: {
                description: "Finish the task and stop execution",
                type: "string",
                const: "finish",
              },
              finalNotes: {
                description: "Final notes or summary of the completed task",
                type: "string",
              },
            },
            required: ["actionType"],
          },
        ],
      },
      minItems: 1,
    })
  })
})
