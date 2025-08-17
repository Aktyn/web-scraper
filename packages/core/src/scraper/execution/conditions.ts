import {
  type ScraperCondition,
  ScraperConditionType,
} from "@web-scraper/common"
import { getScraperValue } from "../data-helper"
import type { ScraperExecutionContext } from "./helpers"
import { getElementHandle } from "./selectors"

export async function checkCondition(
  context: ScraperExecutionContext,
  condition: ScraperCondition,
) {
  try {
    switch (condition.type) {
      case ScraperConditionType.IsElementVisible: {
        const handle = await getElementHandle(
          context,
          condition.selectors,
          condition.pageIndex ?? 0,
        )
        return !!(await handle?.isVisible())
      }
      case ScraperConditionType.AreValuesEqual: {
        const firstValue = await getScraperValue(
          context,
          condition.firstValueSelector,
        )
        const secondValue = await getScraperValue(
          context,
          condition.secondValueSelector,
        )

        if (firstValue instanceof RegExp && secondValue instanceof RegExp) {
          return String(firstValue) === String(secondValue)
        } else if (firstValue instanceof RegExp) {
          return firstValue.test(String(secondValue))
        } else if (secondValue instanceof RegExp) {
          return secondValue.test(String(firstValue))
        } else {
          //TODO: test whether nulls are correctly handled
          // eslint-disable-next-line eqeqeq
          return firstValue == secondValue
        }
      }
    }
  } catch (error) {
    context.logger.fatal(error)
    return false
  }
}
