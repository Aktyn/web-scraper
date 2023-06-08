import {
  ActionStepErrorType,
  randomInt,
  type ActionStep,
  type ActionStepType,
} from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

import type { RequestDataCallback } from './helpers'

export async function fillInputStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.FILL_INPUT },
  requestData: RequestDataCallback,
) {
  const inputHandle = await this.waitFor(
    actionStep.data.element,
    actionStep.data.waitForElementTimeout,
  )
  if (!inputHandle) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  await inputHandle.type(await requestData(actionStep.data.value), { delay: randomInt(100, 500) })

  return { errorType: ActionStepErrorType.NO_ERROR }
}
