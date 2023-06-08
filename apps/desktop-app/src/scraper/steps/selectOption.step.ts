import { ActionStepErrorType, type ActionStep, type ActionStepType } from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

import type { RequestDataCallback } from './helpers'

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

  const result = await selectHandle.select(await requestData(actionStep.data.value))
  if (!result.length) {
    return { errorType: ActionStepErrorType.OPTION_NOT_SELECTED }
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
