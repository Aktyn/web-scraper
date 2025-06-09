import type { ScraperInstructions } from "@web-scraper/common"
import { ScraperInstructionType } from "@web-scraper/common"

export function countInstructions(instructions: ScraperInstructions): number {
  return instructions.reduce((acc, instruction) => {
    if (instruction.type === ScraperInstructionType.Condition) {
      return (
        acc +
        countInstructions(instruction.then) +
        countInstructions(instruction.else ?? [])
      )
    }
    return acc
  }, instructions.length)
}
