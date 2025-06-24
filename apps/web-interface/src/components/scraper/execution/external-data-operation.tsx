import { LabeledValue } from "@/components/common/label/labeled-value"
import { Separator } from "@/components/shadcn/separator"
import { cn } from "@/lib/utils"
import type {
  ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
} from "@web-scraper/common"
import { Fragment, type ComponentProps } from "react"

type ExternalDataOperationProps = {
  operation: Extract<
    ScraperInstructionsExecutionInfo[number],
    { type: ScraperInstructionsExecutionInfoType.ExternalDataOperation }
  >["operation"]
}

export function ExternalDataOperation({
  operation,
}: ExternalDataOperationProps) {
  switch (operation.type) {
    case "get":
      return (
        <ContainerLayout>
          <LabeledValue label="Key">
            <pre>{operation.key}</pre>
          </LabeledValue>
          <LabeledValue
            label="Returned value"
            className="grow grid grid-rows-[auto_1fr]"
          >
            <pre className="max-w-54 contain-size h-full min-h-24 overflow-auto">
              {operation.returnedValue}
            </pre>
          </LabeledValue>
        </ContainerLayout>
      )
    case "set":
      return (
        <ContainerLayout>
          <LabeledValue label="Key">
            <pre>{operation.key}</pre>
          </LabeledValue>
          <LabeledValue label="Value">
            <pre className="max-w-54 contain-size h-full min-h-24 overflow-auto">
              {operation.value}
            </pre>
          </LabeledValue>
        </ContainerLayout>
      )
    case "setMany":
      return (
        <ContainerLayout>
          <LabeledValue label="Data source name">
            <pre>{operation.dataSourceName}</pre>
          </LabeledValue>
          <div className="flex flex-col gap-1 max-w-54 max-h-120 min-h-32 overflow-auto">
            {operation.items.map((item, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <Separator className="opacity-50 my-1" />}
                <div className="flex flex-wrap gap-2">
                  <LabeledValue label="Column">
                    <pre>{item.columnName}</pre>
                  </LabeledValue>
                  <LabeledValue label="Value">
                    <pre>{item.value}</pre>
                  </LabeledValue>
                </div>
              </Fragment>
            ))}
          </div>
        </ContainerLayout>
      )
    case "delete":
      return (
        <ContainerLayout>
          <LabeledValue label="Data source name">
            <pre>{operation.dataSourceName}</pre>
          </LabeledValue>
        </ContainerLayout>
      )
    default:
      return null
  }
}

function ContainerLayout(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col gap-1 grow **:[pre]:text-sm **:[pre]:break-words **:[pre]:whitespace-normal",
        props.className,
      )}
    />
  )
}
