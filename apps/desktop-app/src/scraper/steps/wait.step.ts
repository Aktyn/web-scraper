import {
  ActionStepErrorType,
  wait,
  type ActionStep,
  type ActionStepType,
  type ScraperMode,
} from '@web-scraper/common'

import type { Scraper } from '../scraper'

export async function waitStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.WAIT },
) {
  if (actionStep.data.duration > 0) {
    await wait(actionStep.data.duration)
  }
  return { errorType: ActionStepErrorType.NO_ERROR }
}
