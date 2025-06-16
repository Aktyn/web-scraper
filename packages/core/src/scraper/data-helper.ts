import {
  type ScraperElementSelectors,
  assert,
  ElementSelectorType,
  type ScraperDataKey,
  ScraperInstructionsExecutionInfoType,
  type ScraperValue,
  ScraperValueType,
} from "@web-scraper/common"
import { getElementHandle } from "./execution/selectors"
import type { ScraperExecutionContext } from "./execution/helpers"

export type DataBridgeValue = string | number | null

export interface DataBridge {
  get(key: ScraperDataKey): Promise<DataBridgeValue>
  set(key: ScraperDataKey, value: DataBridgeValue): Promise<void>
  setMany(
    dataSourceName: string,
    items: Array<{ columnName: string; value: DataBridgeValue }>,
  ): Promise<void>
  delete(dataSourceName: string): Promise<void>
}

export async function getScraperValue(
  context: ScraperExecutionContext,
  value: ScraperValue,
) {
  switch (value.type) {
    case ScraperValueType.Literal:
      return await replaceSpecialStrings(value.value, context.dataBridge)

    case ScraperValueType.Null:
      return null

    case ScraperValueType.CurrentTimestamp:
      return Date.now().toString()

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
      const handle = await getElementHandle(context, value.selectors)
      if (!handle) {
        context.logger.warn(
          `Cannot get text content; element not found: ${JSON.stringify(value.selectors)}`,
        )
        return null
      }
      return await handle?.evaluate((el) => el.textContent)
    }
    case ScraperValueType.ElementAttribute: {
      const handle = await getElementHandle(context, value.selectors)
      if (!handle) {
        context.logger.warn(
          `Cannot get attribute; element not found: ${JSON.stringify(value.selectors)}`,
        )
        return null
      }
      return await handle?.evaluate(
        (el, attributeName) => el.getAttribute(attributeName),
        await replaceSpecialStrings(value.attributeName, context.dataBridge),
      )
    }
  }
}

export async function replaceSpecialStrings(
  text: string,
  dataBridge: DataBridge,
): Promise<string> {
  let match: RegExpMatchArray | null = null

  //Search and replace all special strings of ScraperDataKey in the text
  while ((match = text.match(/\{\{([^.}]+\.[^}]+)\}\}/))) {
    if (match.length < 2) {
      break
    }
    const scraperDataKey = match[1] as ScraperDataKey
    const value = await dataBridge.get(scraperDataKey)
    text = text.replace(match[0], value?.toString() ?? "")
  }

  return text
}

/** Replaces special strings (e.g. "{{dataSourceName.columnName}}") in ScraperElementSelectors with actual data from the data bridge. */
export async function replaceSpecialStringsInSelectors(
  selectors: ScraperElementSelectors,
  dataBridge: DataBridge,
) {
  return await Promise.all(
    selectors.map(async (selector) => {
      switch (selector.type) {
        case ElementSelectorType.Query:
          return {
            ...selector,
            query: await replaceSpecialStrings(selector.query, dataBridge),
          }
        case ElementSelectorType.TextContent:
          return {
            ...selector,
            text:
              typeof selector.text === "string"
                ? await replaceSpecialStrings(selector.text, dataBridge)
                : selector.text,
          }
        case ElementSelectorType.TagName:
          return selector
        case ElementSelectorType.Attributes:
          return {
            ...selector,
            attributes: Object.fromEntries(
              await Promise.all(
                Object.entries(selector.attributes).map(
                  async ([attributeName, value]) => [
                    await replaceSpecialStrings(attributeName, dataBridge),
                    typeof value === "string"
                      ? await replaceSpecialStrings(value, dataBridge)
                      : value,
                  ],
                ),
              ),
            ),
          }
        default:
          throw new Error(
            `Unknown selector type: ${(selector as { type: never }).type}`,
          )
      }
    }),
  )
}
