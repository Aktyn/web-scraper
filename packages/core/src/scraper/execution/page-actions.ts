import {
  type Coordinates,
  type PageAction,
  PageActionType,
  type SimpleLogger,
  replaceSpecialStrings,
  wait,
} from "@web-scraper/common"
import { randomInt } from "crypto"
import { getScraperValue } from "../data-helper"
import { detectAndSolveCaptcha } from "./captcha-solver"
import type { ScraperPageContext } from "./execution-pages"
import { type ScraperExecutionContext, getGhostClickOptions } from "./helpers"
import { getElementHandle } from "./selectors"
import { buildSpecialStringContext } from "../helpers"

export async function performPageAction(
  context: ScraperExecutionContext,
  action: PageAction,
  pageContext: ScraperPageContext,
): Promise<void> {
  context.logger.info({ msg: "Performing action", action })

  switch (action.type) {
    case PageActionType.Wait:
      await wait(action.duration)
      break
    case PageActionType.Navigate:
      try {
        await pageContext.page.goto(
          await replaceSpecialStrings(
            action.url,
            buildSpecialStringContext(context),
          ),
          {
            timeout: 30_000,
            waitUntil: "networkidle0",
            signal: context.abortController.signal,
          },
        )
      } catch (error) {
        context.logger.warn({ msg: "Navigation failed", error })
      }
      break

    case PageActionType.Click: {
      const handle = await getElementHandle(
        context,
        action.selectors,
        pageContext.index,
        true,
      )

      if (action.useGhostCursor) {
        pageContext.cursor.toggleRandomMove(false)

        await pageContext.cursor.scrollIntoView(handle, {
          scrollSpeed: 80,
        })
        await wait(1_000)
        await pageContext.cursor.click(handle, getGhostClickOptions())

        pageContext.cursor.toggleRandomMove(true)
      } else {
        await handle.click({
          delay: randomInt(1, 4),
        })
      }

      if (action.waitForNavigation) {
        try {
          await pageContext.page.waitForNavigation({
            waitUntil: "networkidle0",
            signal: context.abortController.signal,
            timeout: 20_000,
          })
        } catch (error) {
          context.logger.warn({
            msg: "An error occurred while waiting for navigation",
            error,
          })
        }
      }
      break
    }
    case PageActionType.SmartClick: {
      const coordinates = await context.ai.localization.localize(
        action.aiPrompt,
        pageContext,
      )

      if (!coordinates) {
        context.logger.warn({
          msg: "Localization failed; no coordinates were returned",
        })
        break
      }

      context.logger.info({ msg: "Localization result", coordinates })

      await preciseClick(
        pageContext,
        coordinates,
        {
          useGhostCursor: action.useGhostCursor,
          waitForNavigation: action.waitForNavigation,
          abortController: context.abortController,
        },
        context.logger,
      )
      break
    }
    case PageActionType.Type: {
      const handle = await getElementHandle(
        context,
        action.selectors,
        pageContext.index,
        true,
      )
      if (action.clearBeforeType) {
        await handle.evaluate((el) => {
          if (el instanceof HTMLInputElement) {
            el.value = ""
          }
        })
      }

      const value = await getScraperValue(context, action.value)
      if (value) {
        await handle.type(value.toString(), {
          delay: randomInt(1, 4),
        })
      }

      if (action.pressEnter) {
        await handle.press("Enter")
      }

      if (action.waitForNavigation) {
        try {
          await pageContext.page.waitForNavigation({
            waitUntil: "networkidle0",
            signal: context.abortController.signal,
            timeout: 20_000,
          })
        } catch (error) {
          context.logger.warn({
            msg: "An error occurred while waiting for navigation",
            error,
          })
        }
      }
      break
    }

    case PageActionType.ScrollToTop:
      await pageContext.cursor.scrollTo("top", {
        scrollSpeed: 50,
      })
      break
    case PageActionType.ScrollToBottom:
      await pageContext.cursor.scrollTo("bottom", {
        scrollSpeed: 50,
      })
      break
    case PageActionType.ScrollToElement: {
      const handle = await getElementHandle(
        context,
        action.selectors,
        pageContext.index,
        true,
      )

      await pageContext.cursor.scrollIntoView(handle, {
        scrollSpeed: 50,
      })

      break
    }

    case PageActionType.Evaluate:
      {
        const evaluationArguments = await Promise.all(
          action.evaluator.arguments?.map((scraperValue) =>
            getScraperValue(context, scraperValue),
          ) ?? [],
        )

        let func: ((...args: unknown[]) => void) | string
        try {
          func = new Function(
            "...args",
            `return (${action.evaluator.code})(...args)`,
          ) as never
        } catch {
          func = action.evaluator.code
        }
        await pageContext.page.evaluate(func, ...evaluationArguments)
      }
      break

    case PageActionType.RunAutonomousAgent: {
      if (action.startUrl) {
        await performPageAction(
          context,
          {
            type: PageActionType.Navigate,
            url: action.startUrl,
          },
          pageContext,
        )
      }

      context.logger.info({
        msg: "Running autonomous agent",
        task: action.task,
      })

      const finalNotes = await context.ai.navigation.run(
        action,
        pageContext,
        context.dataBridge,
        (commonAction) => performPageAction(context, commonAction, pageContext),
      )

      //TODO: log finalNotes
      context.logger.info({ msg: "Autonomous agent completed", finalNotes })

      break
    }
  }

  await wait(randomInt(1_000, 2_000))

  if (context.abortController.signal.aborted) {
    return
  }

  try {
    await detectAndSolveCaptcha(context, pageContext)
  } catch (error) {
    context.logger.error({ msg: "Captcha detection failed", error })
  }
}

type PreciseClickOptions = Partial<{
  useGhostCursor: boolean
  waitForNavigation: boolean
  abortController: AbortController
}>

//TODO: add PreciseClick to pageActionSchema
/** Click on the page at the given coordinates */
export async function preciseClick(
  pageContext: ScraperPageContext,
  coordinates: Coordinates,
  options: PreciseClickOptions,
  logger: SimpleLogger,
) {
  if (options.useGhostCursor) {
    pageContext.cursor.toggleRandomMove(false)

    await pageContext.cursor.moveTo(coordinates, {
      randomizeMoveDelay: true,
      moveDelay: 3_000,
    })
    await pageContext.cursor.click(undefined, getGhostClickOptions())

    pageContext.cursor.toggleRandomMove(true)
  } else {
    await pageContext.page.mouse.click(coordinates.x, coordinates.y, {
      delay: randomInt(1, 4),
    })
  }

  if (options.waitForNavigation) {
    try {
      await pageContext.page.waitForNavigation({
        waitUntil: "networkidle0",
        signal: options.abortController?.signal,
        timeout: 20_000,
      })
    } catch (error) {
      logger.warn({
        msg: "An error occurred while waiting for navigation",
        error,
      })
    }
  }
}
