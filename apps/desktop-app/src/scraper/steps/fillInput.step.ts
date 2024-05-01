import {
  ActionStepErrorType,
  randomInt,
  safePromise,
  wait,
  type ActionStep,
  type ActionStepType,
  type ScraperMode,
} from '@web-scraper/common'

import type { RequestDataCallback } from '../helpers'
import type { Scraper } from '../scraper'

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

  await this.mainPage!.ghostClick(inputHandle)
  await wait(1000)

  await safePromise(inputHandle.evaluate((node) => ((node as HTMLInputElement).value = '')))

  await inputHandle.type(
    await requestData(actionStep.data.valueQuery, actionStep).then((res) => res?.toString() ?? ''),
    {
      delay: randomInt(50, 200),
    },
  )
  if (actionStep.data.pressEnter) {
    if (typeof actionStep.data.delayEnter === 'number') {
      await wait(actionStep.data.delayEnter)
    }

    await inputHandle.focus()
    const pressEnterPromise = this.mainPage!.exposed.keyboard.press('Enter', {
      delay: randomInt(50, 200),
    })

    if (actionStep.data.waitForNavigation) {
      try {
        await this.mainPage!.exposed.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: actionStep.data.waitForNavigationTimeout ?? 30_000,
        })
      } catch (error) {
        this.logger.error(
          `Error while waiting for navigation after pressing enter in input (${
            actionStep.data.element
          }), error: ${error instanceof Error ? error.message : error}`,
        )
        return { errorType: ActionStepErrorType.WAIT_FOR_NAVIGATION_ERROR }
      }
    }

    await pressEnterPromise
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
