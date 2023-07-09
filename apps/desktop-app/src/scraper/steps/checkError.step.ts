import {
  ActionStepErrorType,
  type ActionStep,
  type ActionStepType,
  type MapSiteError,
  type ScraperMode,
} from '@web-scraper/common'

import type { Scraper } from '../scraper'

export async function checkErrorStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.CHECK_ERROR },
): Promise<MapSiteError> {
  const elementError = await this.waitFor(
    actionStep.data.element,
    actionStep.data.waitForElementTimeout,
  )
  if (!elementError) {
    return { errorType: ActionStepErrorType.NO_ERROR } //NOTE: absence of error element is not an error
  }

  const elementTextError = await elementError.evaluate((el) => el.textContent)
  if (!elementTextError) {
    return { errorType: ActionStepErrorType.UNKNOWN }
  }

  const foundError = actionStep.data.mapError.find(({ content }) =>
    content ? elementTextError.match(new RegExp(content, 'i')) : true,
  )
  return foundError ?? { errorType: ActionStepErrorType.NO_ERROR }
}
