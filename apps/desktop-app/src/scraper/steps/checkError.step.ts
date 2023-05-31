import {
  ActionStepErrorType,
  type ActionStep,
  type ActionStepType,
  type MapSiteError,
} from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

export async function checkErrorStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.CHECK_ERROR },
): Promise<MapSiteError> {
  const elementError = await this.waitFor(actionStep.data.element, 30_000) //TODO: parametrize timeout
  if (!elementError) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  const elementTextError = await elementError.evaluate((el) => el.textContent)
  if (!elementTextError) {
    return { errorType: ActionStepErrorType.UNKNOWN }
  }

  const foundError = actionStep.data.mapError.find(({ content }) =>
    //TODO: allow regex pattern
    elementTextError.includes(content ?? ''),
  )
  return foundError ?? { errorType: ActionStepErrorType.NO_ERROR }
}
