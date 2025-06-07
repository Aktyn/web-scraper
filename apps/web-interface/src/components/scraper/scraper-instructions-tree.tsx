import type { ScraperInstructions } from "@web-scraper/common"
import { InstructionBlock } from "./instruction-block"

type ScraperInstructionsProps = {
  instructions: ScraperInstructions
}

export function ScraperInstructionsTree({
  instructions,
}: ScraperInstructionsProps) {
  if (instructions.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-sm text-warning">
            No scraper instructions defined
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {instructions.map((instruction, index) => (
        <InstructionBlock
          key={`instruction-${instruction.type}-${index}`}
          instruction={instruction}
        />
      ))}
    </div>
  )
}
