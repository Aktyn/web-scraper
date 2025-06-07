import { describe, expect, it } from "vitest"
import {
  type ScraperInstructions,
  scraperInstructionsSchema,
  ScraperInstructionType,
} from "./instructions"
import { PageActionType } from "./page-action"
import { ElementSelectorType } from "./selectors"

describe("scraperInstructionsSchema", () => {
  it("should properly parse instructions", () => {
    const instructions: ScraperInstructions = [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: "Click me",
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
          ],
        },
      },
    ]

    const result = scraperInstructionsSchema.safeParse(instructions)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(instructions)
  })

  it("should parse serialized instructions with regexp", () => {
    const instructions: ScraperInstructions = [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: {
                source: "Click me",
                flags: "i",
              },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
          ],
        },
      },
    ]
    const serialized = JSON.parse(JSON.stringify(instructions))

    const result = scraperInstructionsSchema.safeParse(serialized)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(instructions)
  })

  it("should fail to parse invalid instructions", () => {
    const instructions: ScraperInstructions = [
      //@ts-expect-error - invalid instruction
      {
        type: ScraperInstructionType.PageAction,
      },
    ]

    const result = scraperInstructionsSchema.safeParse(instructions)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
