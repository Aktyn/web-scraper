import {
  ActionStepErrorType,
  type ActionStep,
  type ActionStepType,
  type ScraperMode,
} from '@web-scraper/common'

import type { RequestDataCallback } from '../helpers'
import type { Scraper } from '../scraper'

export async function selectOptionStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.SELECT_OPTION },
  requestData: RequestDataCallback,
) {
  const selectHandle = await this.waitFor(
    actionStep.data.element,
    actionStep.data.waitForElementTimeout,
  )
  if (!selectHandle) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  const result = await selectHandle.select(
    await requestData(actionStep.data.valueQuery, actionStep).then((res) => res?.toString() ?? ''),
  )
  if (!result.length) {
    return { errorType: ActionStepErrorType.OPTION_NOT_SELECTED }
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
