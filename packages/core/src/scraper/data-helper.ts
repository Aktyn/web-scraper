import {
  assert,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  type ScraperValue,
  ScraperValueType,
} from "@web-scraper/common"

export interface DataBridge {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

export async function getScraperValue(
  value: ScraperValue,
  dataBridge: DataBridge,
  executionInfo: ScraperInstructionsExecutionInfo,
) {
  switch (value.type) {
    case ScraperValueType.Literal:
      return value.value
    case ScraperValueType.ExternalData: {
      const returnedValue = await dataBridge.get(value.key)
      const output = returnedValue ?? value.defaultValue
      assert(
        !!output,
        `External data value not found and no default value provided. Key: ${value.key}`,
      )
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
        operation: {
          type: "get",
          key: value.key,
          returnedValue,
        },
      })
      return output
    }
  }
}
