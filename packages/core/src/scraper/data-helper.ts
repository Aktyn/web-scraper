import {
  type ScraperElementSelectors,
  assert,
  ElementSelectorType,
  type ScraperDataKey,
  ScraperInstructionsExecutionInfoType,
  type ScraperValue,
  ScraperValueType,
  replaceSpecialStrings,
} from "@web-scraper/common"
import { getElementHandle } from "./execution/selectors"
import type { ScraperExecutionContext } from "./execution/helpers"
import { buildSpecialStringContext } from "./helpers"

export type DataBridgeValue = string | number | null

export interface DataBridge {
  getSchema(): Promise<Record<ScraperDataKey, "string" | "number">>

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
  stringifyRegex?: false,
): Promise<string | number | RegExp | null>

export async function getScraperValue(
  context: ScraperExecutionContext,
  value: ScraperValue,
  stringifyRegex: true,
): Promise<string | number | null>

export async function getScraperValue(
  context: ScraperExecutionContext,
  value: ScraperValue,
  stringifyRegex?: boolean,
): Promise<string | number | RegExp | null> {
  switch (value.type) {
    case ScraperValueType.Literal:
      if (typeof value.value === "string") {
        return await replaceSpecialStrings(
          value.value,
          buildSpecialStringContext(context),
        )
      } else if (stringifyRegex) {
        return String(value.value)
      } else {
        const sourceRaw = await replaceSpecialStrings(
          value.value.source,
          buildSpecialStringContext(context),
        )
        const regex = new RegExp(sourceRaw, value.value.flags)
        return regex
      }

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
      const handle = await getElementHandle(
        context,
        value.selectors,
        value.pageIndex ?? 0,
      )
      if (!handle) {
        context.logger.warn(
          `Cannot get text content; element not found: ${JSON.stringify(value.selectors)}`,
        )
        return null
      }
      return await handle?.evaluate((el) => el.textContent)
    }
    case ScraperValueType.ElementAttribute: {
      const handle = await getElementHandle(
        context,
        value.selectors,
        value.pageIndex ?? 0,
      )
      if (!handle) {
        context.logger.warn(
          `Cannot get attribute; element not found: ${JSON.stringify(value.selectors)}`,
        )
        return null
      }
      return await handle?.evaluate(
        (el, attributeName) => el.getAttribute(attributeName),
        await replaceSpecialStrings(
          value.attributeName,
          buildSpecialStringContext(context),
        ),
      )
    }
  }
}

/** Replaces special strings (e.g. "{{dataSourceName.columnName}}") in ScraperElementSelectors with actual data from the data bridge. */
export async function replaceSpecialStringsInSelectors(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
) {
  return await Promise.all(
    selectors.map(async (selector) => {
      switch (selector.type) {
        case ElementSelectorType.Query:
          return {
            ...selector,
            query: await replaceSpecialStrings(
              selector.query,
              buildSpecialStringContext(context),
            ),
          }
        case ElementSelectorType.TextContent:
          return {
            ...selector,
            text:
              typeof selector.text === "string"
                ? await replaceSpecialStrings(
                    selector.text,
                    buildSpecialStringContext(context),
                  )
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
                    await replaceSpecialStrings(
                      attributeName,
                      buildSpecialStringContext(context),
                    ),
                    typeof value === "string"
                      ? await replaceSpecialStrings(
                          value,
                          buildSpecialStringContext(context),
                        )
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
