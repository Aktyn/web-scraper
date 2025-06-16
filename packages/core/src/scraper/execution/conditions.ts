import {
  type ScraperCondition,
  ScraperConditionType,
} from "@web-scraper/common"
import { getScraperValue, replaceSpecialStrings } from "../data-helper"
import type { ScraperExecutionContext } from "./helpers"
import { getElementHandle } from "./selectors"

export async function checkCondition(
  context: ScraperExecutionContext,
  condition: ScraperCondition,
) {
  try {
    switch (condition.type) {
      case ScraperConditionType.IsVisible: {
        const handle = await getElementHandle(context, condition.selectors)
        return !!(await handle?.isVisible())
      }
      case ScraperConditionType.TextEquals: {
        const value = await getScraperValue(context, condition.valueSelector)
        if (value === null || value === undefined) {
          return false
        }
        if (typeof condition.text === "string") {
          return (
            value ===
            (await replaceSpecialStrings(condition.text, context.dataBridge))
          )
        }
        return new RegExp(condition.text.source, condition.text.flags).test(
          value.toString(),
        )
      }
    }
  } catch (error) {
    context.logger.fatal(error)
    return false
  }
}
