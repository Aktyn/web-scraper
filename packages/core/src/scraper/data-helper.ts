import {
  assert,
  type ScraperDataKey,
  ScraperInstructionsExecutionInfoType,
  type ScraperValue,
  ScraperValueType,
} from "@web-scraper/common"
import { type ScraperExecutionContext } from "./helpers"
import { getElementHandle } from "./selectors"

export type Cursor = { [key: string]: string | number }

export type DataBridgeValue = string | number | null

export interface DataBridge {
  get(key: ScraperDataKey, cursor?: Cursor): Promise<DataBridgeValue>
  set(
    key: ScraperDataKey,
    value: DataBridgeValue,
    cursor?: Cursor,
  ): Promise<void>
  setMany(
    dataSourceName: string,
    items: Array<{ columnName: string; value: DataBridgeValue }>,
    cursor?: Cursor,
  ): Promise<void>
  delete(dataSourceName: string, cursor?: Cursor): Promise<void>
}

export async function getScraperValue(
  context: ScraperExecutionContext,
  value: ScraperValue,
) {
  switch (value.type) {
    case ScraperValueType.Literal:
      return value.value
    case ScraperValueType.CurrentTimestamp: {
      return Date.now().toString()
    }

    case ScraperValueType.ExternalData: {
      const returnedValue = await context.dataBridge.get(value.dataKey)
      const output = returnedValue ?? value.defaultValue
      assert(
        !!output,
        `External data value not found and no default value provided. Key: ${value.dataKey}`,
      )
      context.executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
        operation: {
          type: "get",
          key: value.dataKey,
          returnedValue,
        },
      })
      return output
    }

    case ScraperValueType.ElementTextContent: {
      const handle = await getElementHandle(context.page, value.selectors)
      if (!handle) {
        context.logger.warn(
          `Cannot get text content; element not found: ${value.selectors}`,
        )
        return null
      }
      return await handle?.evaluate((el) => el.textContent)
    }
    case ScraperValueType.ElementAttribute: {
      const handle = await getElementHandle(context.page, value.selectors)
      if (!handle) {
        context.logger.warn(
          `Cannot get attribute; element not found: ${value.selectors}`,
        )
        return null
      }
      return await handle?.evaluate(
        (el, attributeName) => el.getAttribute(attributeName),
        value.attributeName,
      )
    }
  }
}
