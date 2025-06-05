import { LabeledValue } from "@/components/common/labeled-value"
import type {
  ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
} from "@web-scraper/common"

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
        <div className="flex flex-col gap-1 grow">
          <LabeledValue label="Key">
            <pre className="text-sm break-all whitespace-normal">
              {operation.key}
            </pre>
          </LabeledValue>
          <LabeledValue
            label="Returned value"
            className="grow grid grid-rows-[auto_1fr]"
          >
            <div className="max-w-54 contain-size h-full min-h-24 overflow-auto">
              {operation.returnedValue}
            </div>
          </LabeledValue>
        </div>
      )
    case "set":
      return (
        <div className="flex flex-col gap-1">
          <LabeledValue label="Key">
            <pre className="text-sm break-all whitespace-normal">
              {operation.key}
            </pre>
          </LabeledValue>
          <LabeledValue label="Value">{operation.value}</LabeledValue>
        </div>
      )
    case "setMany":
      return (
        <div className="flex flex-col gap-1">
          <LabeledValue label="Data Source Name">
            <pre className="text-sm break-all whitespace-normal">
              {operation.dataSourceName}
            </pre>
          </LabeledValue>
          <div className="flex flex-col gap-1">
            {operation.items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <LabeledValue label="Column">{item.columnName}</LabeledValue>
                <LabeledValue label="Value">{item.value}</LabeledValue>
              </div>
            ))}
          </div>
        </div>
      )
    case "delete":
      return (
        <div className="flex flex-col gap-1">
          <LabeledValue label="Data Source Name">
            <pre className="text-sm break-all whitespace-normal">
              {operation.dataSourceName}
            </pre>
          </LabeledValue>
        </div>
      )
    default:
      return null
  }
}
