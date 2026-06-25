import {
  type Coordinates,
  ElementSelectorType,
  type PageAction,
  PageActionType,
  type SimpleLogger,
  replaceSpecialStrings,
  wait,
} from "@web-scraper/common"
import { randomInt } from "crypto"
import type { Page } from "playwright"
import { getScraperValue } from "../data-helper"
import { buildSpecialStringContext } from "../helpers"
import { detectAndSolveCaptcha } from "./captcha-solver"
import type { ScraperPageContext } from "./execution-pages"
import type { ScraperExecutionContext } from "./helpers"
import { evaluateHandle, getElementHandle } from "./selectors"

type PlaywrightGotoOptions = {
  referer?: string
  timeout?: number
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit"
  signal?: AbortSignal
}

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
        const navOptions: PlaywrightGotoOptions = {
          timeout: 30_000,
          waitUntil: "networkidle",
          signal: context.abortController.signal,
        }
        await pageContext.page.goto(
          await replaceSpecialStrings(
            action.url,
            buildSpecialStringContext(context),
          ),
          navOptions,
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
        const box = await handle.boundingBox()
        if (!box) {
          context.logger.warn({ msg: "Element not visible for clicking" })
          break
        }
        await humanMoveTo(pageContext.page, {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        })
        await humanClick(pageContext.page)
      } else {
        await handle.click({
          delay: randomInt(1, 4),
        })
      }

      if (action.waitForNavigation) {
        try {
          await pageContext.page.waitForURL("**", {
            waitUntil: "networkidle",
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
        pageContext.page,
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
        await handle.fill("")
        await handle.type(value.toString(), {
          delay: randomInt(1, 4),
        })
      }

      if (action.pressEnter) {
        await pageContext.page.keyboard.press("Enter")
      }

      if (action.waitForNavigation) {
        try {
          await pageContext.page.waitForURL("**", {
            waitUntil: "networkidle",
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
      await pageContext.page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
      })
      break
    case PageActionType.ScrollToBottom:
      await pageContext.page.evaluate(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "instant",
        })
      })
      break
    case PageActionType.ScrollToElement: {
      const handle = await getElementHandle(
        context,
        action.selectors,
        pageContext.index,
        true,
      )

      await handle.evaluate((el) => {
        el.scrollIntoView({ behavior: "instant", block: "center" })
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

      const answer = await context.ai.navigation.run(
        action,
        pageContext,
        context.dataBridge,
        (commonAction) => performPageAction(context, commonAction, pageContext),
      )

      //TODO: log finalNotes
      context.logger.info({ msg: "Autonomous agent completed", answer })

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

export type PreciseClickOptions = Partial<{
  useGhostCursor: boolean
  waitForNavigation: boolean
  abortController: AbortController
}>

/** Click on the page at the given coordinates */
export async function preciseClick(
  page: Page,
  coordinates: Coordinates,
  options: PreciseClickOptions,
  logger: SimpleLogger,
) {
  if (options.useGhostCursor) {
    await humanMoveTo(page, coordinates)
    await humanClick(page)
  } else {
    await page.mouse.click(coordinates.x, coordinates.y, {
      delay: randomInt(1, 4),
    })
  }

  if (options.waitForNavigation) {
    try {
      await page.waitForURL("**", {
        waitUntil: "networkidle",
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

/** Find element by query and click it */
export async function findAndClick(
  pageContext: ScraperPageContext,
  query: string,
  options: PreciseClickOptions,
  logger: SimpleLogger,
) {
  const handle = await evaluateHandle(pageContext.page, {}, [
    {
      type: ElementSelectorType.Query,
      query,
    },
  ])

  if (!handle) {
    logger.warn({ msg: "Element not found", query })
    return false
  }

  const box = await handle.boundingBox()
  if (!box) {
    logger.warn({ msg: "Element not visible", query })
    return false
  }

  const coordinates = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await preciseClick(pageContext.page, coordinates, options, logger)
  return true
}

/** Find element by query and focus it */
export async function findAndFocus(
  pageContext: ScraperPageContext,
  query: string,
) {
  const handle = await evaluateHandle(pageContext.page, {}, [
    {
      type: ElementSelectorType.Query,
      query,
    },
  ])

  if (!handle) return false

  await handle.focus()
  return true
}

async function humanMoveTo(page: Page, to: Coordinates) {
  const mouse = page.mouse
  const steps = 3
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps
    const x = Math.random() * 20 - 10
    const y = Math.random() * 20 - 10
    await mouse.move(to.x * progress + x, to.y * progress + y, { steps: 5 })
    await wait(randomInt(5, 20))
  }
}

async function humanClick(page: Page) {
  await wait(randomInt(50, 150))
  await page.mouse.down()
  await wait(randomInt(20, 80))
  await page.mouse.up()
}
