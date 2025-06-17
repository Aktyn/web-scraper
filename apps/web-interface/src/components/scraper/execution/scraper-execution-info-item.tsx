import { CopyButton } from "@/components/common/button/copy-button"
import { ExternalLink } from "@/components/common/button/external-link"
import { LabeledValue } from "@/components/common/label/labeled-value"
import { Badge } from "@/components/shadcn/badge"
import {
  instructionTypeLabels,
  scraperInstructionsExecutionInfoTypeLabels,
} from "@/lib/dictionaries"
import { cn, formatDuration } from "@/lib/utils"
import {
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import { type ComponentProps, type PropsWithChildren } from "react"
import { ExternalDataOperation } from "./external-data-operation"
import { ScraperInstructionInfo } from "./scraper-instruction-info"
import { palette } from "@/lib/palette"

type ScraperExecutionInfoItemProps = {
  executionInfo: ScraperInstructionsExecutionInfo[number]
} & ComponentProps<"div">

export function ScraperExecutionInfoItem({
  executionInfo,
  ...divProps
}: ScraperExecutionInfoItemProps) {
  switch (executionInfo.type) {
    case ScraperInstructionsExecutionInfoType.Instruction:
      return (
        <ContainerLayout
          {...divProps}
          className={cn(
            executionInfo.instructionInfo.type ===
              ScraperInstructionType.Condition
              ? executionInfo.instructionInfo.isMet
                ? "border border-dashed border-primary/50"
                : "border border-dashed border-secondary/50"
              : "",
            divProps.className,
          )}
        >
          <HeaderLayout>
            <Badge variant="outline">
              {scraperInstructionsExecutionInfoTypeLabels[executionInfo.type]}
            </Badge>
            <span className="text-sm">
              {instructionTypeLabels[executionInfo.instructionInfo.type]}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDuration(executionInfo.duration, "second")}
            </span>
          </HeaderLayout>
          <ScraperInstructionInfo info={executionInfo.instructionInfo} />
        </ContainerLayout>
      )

    case ScraperInstructionsExecutionInfoType.ExternalDataOperation:
      return (
        <ContainerLayout {...divProps}>
          <HeaderLayout>
            <Badge
              variant="secondary"
              className="max-w-32 truncate inline-block justify-start"
            >
              {scraperInstructionsExecutionInfoTypeLabels[executionInfo.type]}
            </Badge>
            <span className="capitalize font-medium">
              {executionInfo.operation.type}
            </span>
          </HeaderLayout>
          <ExternalDataOperation operation={executionInfo.operation} />
        </ContainerLayout>
      )

    case ScraperInstructionsExecutionInfoType.PageOpened:
      return (
        <ContainerLayout
          {...divProps}
          style={
            executionInfo.pageIndex
              ? {
                  borderColor: `${palette[executionInfo.pageIndex % palette.length]}50`,
                  backgroundColor: `${palette[executionInfo.pageIndex % palette.length]}04`,
                }
              : undefined
          }
        >
          <HeaderLayout>
            <Badge variant="secondary">
              {scraperInstructionsExecutionInfoTypeLabels[executionInfo.type]}
            </Badge>
          </HeaderLayout>
          <LabeledValue label="Page index:">
            {executionInfo.pageIndex}
          </LabeledValue>
          {executionInfo.portalUrl && (
            <LabeledValue label="Portal URL:">
              <ExternalLink
                url={executionInfo.portalUrl}
                className="max-w-64 inline-block"
              />
            </LabeledValue>
          )}
        </ContainerLayout>
      )

    case ScraperInstructionsExecutionInfoType.Success:
      return (
        <ContainerLayout
          {...divProps}
          className={cn(
            "border-success/50 min-w-56 max-w-64",
            divProps.className,
          )}
        >
          <HeaderLayout>
            <Badge className="bg-success text-success-foreground">
              {scraperInstructionsExecutionInfoTypeLabels[executionInfo.type]}
            </Badge>
          </HeaderLayout>
          <LabeledValue label="Total:">
            <span className="text-sm font-semibold">
              {formatDuration(executionInfo.summary.duration, "second")}
            </span>
          </LabeledValue>
          <div className="text-sm text-pretty text-success">
            Scraper finished successfully.
          </div>
        </ContainerLayout>
      )
    case ScraperInstructionsExecutionInfoType.Error: {
      return (
        <ContainerLayout
          {...divProps}
          className={cn(
            "border-destructive/50 min-w-56 max-w-64",
            divProps.className,
          )}
        >
          <HeaderLayout>
            <Badge variant="destructive">
              {scraperInstructionsExecutionInfoTypeLabels[executionInfo.type]}
            </Badge>
            <CopyButton
              value={executionInfo.errorMessage}
              className="size-6 ml-auto"
              content="Copy error message"
            />
          </HeaderLayout>
          <div className="text-sm text-pretty text-destructive whitespace-normal break-words">
            {executionInfo.errorMessage}
          </div>
        </ContainerLayout>
      )
    }
    default:
      return (
        <div className="text-xs text-muted-foreground">
          Unknown execution info type
        </div>
      )
  }
}

function ContainerLayout(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "rounded border border-background-lighter bg-card p-3 flex flex-col gap-3",
        props.className,
      )}
    />
  )
}

export const ScraperExecutionInfoContainer = ContainerLayout

function HeaderLayout({ children }: PropsWithChildren) {
  return (
    <div className="text-base *:leading-none flex flex-row items-center justify-start gap-3 whitespace-nowrap">
      {children}
    </div>
  )
}

export const ScraperExecutionInfoHeader = HeaderLayout
