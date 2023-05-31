import {
  ActionStepErrorType,
  type ActionStep,
  type ActionStepType,
  type MapSiteError,
} from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

export async function checkSuccessStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.CHECK_SUCCESS },
): Promise<MapSiteError> {
  const elementSuccess = await this.waitFor(actionStep.data.element, 30_000) //TODO: parametrize timeout
  if (!elementSuccess) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  const elementTextSuccess = await elementSuccess.evaluate((el) => el.textContent)
  if (!elementTextSuccess) {
    return { errorType: ActionStepErrorType.UNKNOWN }
  }

  const foundSuccess = actionStep.data.mapSuccess.find(({ content }) =>
    //TODO: allow regex pattern
    elementTextSuccess.includes(content ?? ''),
  )
  if (foundSuccess) {
    return { errorType: ActionStepErrorType.NO_ERROR }
  }
  return { errorType: ActionStepErrorType.UNKNOWN }
}
