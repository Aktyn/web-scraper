import {
  ActionStepErrorType,
  randomInt,
  type ActionStep,
  type ActionStepType,
  type ScraperMode,
} from '@web-scraper/common'
import type { ElementHandle } from 'puppeteer'

import type { Scraper } from '../scraper'
import type { ScraperPage } from '../scraperPage'

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
    const clickPromise = clickButton(this.mainPage!, buttonHandle)
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
    await clickButton(this.mainPage!, buttonHandle)
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}

async function clickButton(page: ScraperPage, buttonHandle: ElementHandle<Element>) {
  try {
    await page.ghostClick(buttonHandle)
  } catch (error) {
    console.error('Error while ghost clicking button', error)

    await buttonHandle.click({
      delay: randomInt(50, 200),
    })
  }
}
