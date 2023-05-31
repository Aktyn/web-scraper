import {
  wait,
  type ActionStep,
  type ActionStepType,
  ActionStepErrorType,
} from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

export async function waitStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.WAIT },
) {
  if (actionStep.data.duration > 0) {
    await wait(actionStep.data.duration)
  }
  return { errorType: ActionStepErrorType.NO_ERROR }
}
