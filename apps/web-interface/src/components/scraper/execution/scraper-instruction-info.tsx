import { Label } from "@/components/shadcn/label"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import {
  ScraperInstructionType,
  type ScraperInstructionInfo,
} from "@web-scraper/common"
import { Check, X } from "lucide-react"
import type { ComponentProps } from "react"
import { ConditionInstruction } from "../instruction-types/condition-instruction"
import {
  JumpInstruction,
  MarkerInstruction,
} from "../instruction-types/control-flow-instruction"
import {
  DeleteDataInstruction,
  SaveDataBatchInstruction,
  SaveDataInstruction,
} from "../instruction-types/data-instruction"
import { PageActionInstruction } from "../instruction-types/page-action-instruction"
import { SystemActionInstruction } from "../instruction-types/system-action-instruction"
import { DeleteCookiesInstruction } from "../instruction-types/delete-cookies-instruction"

type ExternalDataOperationProps = {
  info: ScraperInstructionInfo
}

export function ScraperInstructionInfo({ info }: ExternalDataOperationProps) {
  switch (info.type) {
    case ScraperInstructionType.PageAction:
      return (
        <ContainerLayout>
          <PageActionInstruction
            pageIndex={info.pageIndex}
            action={info.action}
            pageUrl={info.pageUrl}
          />
        </ContainerLayout>
      )
    case ScraperInstructionType.Condition:
      return (
        <ContainerLayout>
          <ConditionInstruction
            condition={info.condition}
            thenInstructions={[]}
            additionalHeaderContent={
              <div className="flex items-center gap-1 ml-auto *:[svg]:size-4">
                <Label className="text-sm leading-none">Met:</Label>
                {info.isMet ? (
                  <Check className="text-success" />
                ) : (
                  <X className="text-destructive" />
                )}
              </div>
            }
          />
        </ContainerLayout>
      )
    case ScraperInstructionType.DeleteCookies:
      return (
        <ContainerLayout>
          <DeleteCookiesInstruction
            domain={info.domain}
            deletedCookies={info.deletedCookies}
          />
        </ContainerLayout>
      )
    case ScraperInstructionType.SaveData:
      return (
        <ContainerLayout>
          <SaveDataInstruction dataKey={info.dataKey} value={info.value} />
        </ContainerLayout>
      )
    case ScraperInstructionType.SaveDataBatch:
      return (
        <ContainerLayout>
          <SaveDataBatchInstruction
            dataSourceName={info.dataSourceName}
            items={info.items}
          />
        </ContainerLayout>
      )
    case ScraperInstructionType.DeleteData:
      return (
        <ContainerLayout>
          <DeleteDataInstruction dataSourceName={info.dataSourceName} />
        </ContainerLayout>
      )
    case ScraperInstructionType.Marker:
      return (
        <ContainerLayout>
          <MarkerInstruction name={info.name} />
        </ContainerLayout>
      )
    case ScraperInstructionType.Jump:
      return (
        <ContainerLayout>
          <JumpInstruction markerName={info.markerName} />
        </ContainerLayout>
      )
    case ScraperInstructionType.SystemAction:
      return (
        <ContainerLayout>
          <SystemActionInstruction systemAction={info.systemAction} />
        </ContainerLayout>
      )
    default:
      return <div>Unknown instruction type</div>
  }
}

function ContainerLayout(props: ComponentProps<"div">) {
  return (
    <Slot
      {...props}
      className={cn(
        "flex flex-col gap-2 border bg-background rounded-md p-2 text-sm",
        props.className,
      )}
    />
  )
}
