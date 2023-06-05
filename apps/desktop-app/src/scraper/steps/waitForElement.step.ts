import { ActionStepErrorType, type ActionStep, type ActionStepType } from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

export async function waitForElementStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.WAIT_FOR_ELEMENT },
) {
  const handle = await this.waitFor(actionStep.data.element, actionStep.data.timeout)
  if (!handle) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
