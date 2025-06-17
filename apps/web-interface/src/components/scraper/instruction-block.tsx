import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import {
  type ScraperInstructions,
  ScraperInstructionType,
} from "@web-scraper/common"
import { CircleAlert } from "lucide-react"
import type { PropsWithChildren } from "react"
import { ConditionInstruction } from "./instruction-types/condition-instruction"
import {
  JumpInstruction,
  MarkerInstruction,
} from "./instruction-types/control-flow-instruction"
import {
  DeleteDataInstruction,
  SaveDataBatchInstruction,
  SaveDataInstruction,
} from "./instruction-types/data-instruction"
import { PageActionInstruction } from "./instruction-types/page-action-instruction"
import { SystemActionInstruction } from "./instruction-types/system-action-instruction"

type InstructionBlockProps = {
  instruction: ScraperInstructions[number]
}

export function InstructionBlock({ instruction }: InstructionBlockProps) {
  switch (instruction.type) {
    case ScraperInstructionType.PageAction:
      return (
        <BlockContainer asChild>
          <PageActionInstruction
            pageIndex={instruction.pageIndex}
            action={instruction.action}
          />
        </BlockContainer>
      )

    case ScraperInstructionType.Condition:
      return (
        <BlockContainer asChild>
          <ConditionInstruction
            condition={instruction.if}
            thenInstructions={instruction.then}
            elseInstructions={instruction.else}
          />
        </BlockContainer>
      )

    case ScraperInstructionType.SaveData:
      return (
        <BlockContainer asChild>
          <SaveDataInstruction
            dataKey={instruction.dataKey}
            value={instruction.value}
          />
        </BlockContainer>
      )
    case ScraperInstructionType.SaveDataBatch:
      return (
        <BlockContainer asChild>
          <SaveDataBatchInstruction
            dataSourceName={instruction.dataSourceName}
            items={instruction.items}
          />
        </BlockContainer>
      )

    case ScraperInstructionType.DeleteData:
      return (
        <BlockContainer asChild>
          <DeleteDataInstruction dataSourceName={instruction.dataSourceName} />
        </BlockContainer>
      )

    case ScraperInstructionType.Marker:
      return (
        <BlockContainer asChild>
          <MarkerInstruction name={instruction.name} />
        </BlockContainer>
      )

    case ScraperInstructionType.Jump:
      return (
        <BlockContainer asChild>
          <JumpInstruction markerName={instruction.markerName} />
        </BlockContainer>
      )

    case ScraperInstructionType.SystemAction:
      return (
        <BlockContainer asChild>
          <SystemActionInstruction systemAction={instruction.systemAction} />
        </BlockContainer>
      )

    default:
      return (
        <BlockContainer className="bg-destructive/20 border-destructive-foreground text-destructive-foreground flex-row items-center gap-2">
          <CircleAlert />
          <span className="text-sm">
            Unknown instruction type:{" "}
            <strong>{String((instruction as { type: unknown }).type)}</strong>
          </span>
        </BlockContainer>
      )
  }
}

function BlockContainer({
  children,
  asChild,
  className,
}: PropsWithChildren<{ asChild?: boolean; className?: string }>) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        "border rounded-lg bg-card flex flex-col gap-2 p-3 in-data-[then-instructions]:bg-transparent in-data-[else-instructions]:bg-transparent",
        className,
      )}
    >
      {children}
    </Comp>
  )
}

export const InstructionBlockContainer = BlockContainer
