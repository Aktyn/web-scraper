import {
  wait,
  type ActionStep,
  type ActionStepType,
  ActionStepErrorType,
} from '@web-scraper/common'

import type { Scraper, ScraperMode } from '../scraper'

export async function pressButtonStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.PRESS_BUTTON },
) {
  await this.waitFor(actionStep.data.element)

  if (actionStep.data.waitForNavigation) {
    const clickPromise = this.mainPage!.exposed.click(actionStep.data.element)
    try {
      await this.mainPage!.exposed.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 30_000, //TODO parametrize
      })
    } catch (error) {
      this.logger.error(
        `Error while waiting for navigation after pressing button (${
          actionStep.data.element
        }), error: ${error instanceof Error ? error.message : error}`,
      )
      return { errorType: ActionStepErrorType.WAIT_FOR_NAVIGATION_ERROR }
    }

    await clickPromise
  } else {
    await this.mainPage!.exposed.click(actionStep.data.element)
    await wait(2_000) //TODO: it should be parameterized as delay variable in site instructions
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
