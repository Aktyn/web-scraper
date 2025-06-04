import { Slot } from "@radix-ui/react-slot"
import {
  type ScraperInstructions,
  ScraperInstructionType,
} from "@web-scraper/common"
import { CircleAlert } from "lucide-react"
import type { PropsWithChildren } from "react"
import { ConditionInstruction } from "./instruction-types/condition-instruction"
import { PageActionInstruction } from "./instruction-types/page-action-instruction"
import {
  DeleteDataInstruction,
  SaveDataBatchInstruction,
  SaveDataInstruction,
} from "./instruction-types/data-instruction"
import {
  JumpInstruction,
  MarkerInstruction,
} from "./instruction-types/control-flow-instruction"

function BlockContainer({ children }: PropsWithChildren) {
  return (
    <Slot className="border rounded-lg bg-card flex flex-col gap-2 p-3 in-data-[then-instructions]:bg-transparent in-data-[else-instructions]:bg-transparent">
      {children}
    </Slot>
  )
}

export function InstructionBlock({
  instruction,
}: {
  instruction: ScraperInstructions[number]
}) {
  switch (instruction.type) {
    case ScraperInstructionType.PageAction:
      return (
        <BlockContainer>
          <PageActionInstruction action={instruction.action} />
        </BlockContainer>
      )

    case ScraperInstructionType.Condition:
      return (
        <BlockContainer>
          <ConditionInstruction
            condition={instruction.if}
            thenInstructions={instruction.then}
            elseInstructions={instruction.else}
          />
        </BlockContainer>
      )

    case ScraperInstructionType.SaveData:
      return (
        <BlockContainer>
          <SaveDataInstruction
            dataKey={instruction.dataKey}
            value={instruction.value}
          />
        </BlockContainer>
      )
    case ScraperInstructionType.SaveDataBatch:
      return (
        <BlockContainer>
          <SaveDataBatchInstruction
            dataSourceName={instruction.dataSourceName}
            items={instruction.items}
          />
        </BlockContainer>
      )

    case ScraperInstructionType.DeleteData:
      return (
        <BlockContainer>
          <DeleteDataInstruction dataSourceName={instruction.dataSourceName} />
        </BlockContainer>
      )

    case ScraperInstructionType.Marker:
      return (
        <BlockContainer>
          <MarkerInstruction name={instruction.name} />
        </BlockContainer>
      )

    case ScraperInstructionType.Jump:
      return (
        <BlockContainer>
          <JumpInstruction markerName={instruction.markerName} />
        </BlockContainer>
      )

    default:
      return (
        <div className="border rounded-lg p-3 bg-destructive/20 border-destructive-foreground text-destructive-foreground flex flex-row items-center gap-2">
          <CircleAlert />
          <span className="text-sm">
            Unknown instruction type:{" "}
            <strong>{String((instruction as { type: unknown }).type)}</strong>
          </span>
        </div>
      )
  }
}
