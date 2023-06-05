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
  const buttonHandle = await this.waitFor(
    actionStep.data.element,
    actionStep.data.waitForElementTimeout,
  )

  if (!buttonHandle) {
    return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
  }

  if (actionStep.data.waitForNavigation) {
    const clickPromise = buttonHandle.click()
    try {
      await this.mainPage!.exposed.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: actionStep.data.waitForNavigationTimeout ?? 30_000,
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
    await buttonHandle.click()
    await wait(2_000) //TODO: it should be parameterized as delay variable in site instructions
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
