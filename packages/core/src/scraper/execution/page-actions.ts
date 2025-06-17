import {
  type PageAction,
  PageActionType,
  replaceSpecialStrings,
  wait,
} from "@web-scraper/common"
import { randomInt } from "crypto"
import { getScraperValue } from "../data-helper"
import { detectAndSolveCaptcha } from "./captcha-solver"
import type { ScraperPageContext } from "./execution-pages"
import { type ScraperExecutionContext, getGhostClickOptions } from "./helpers"
import { getElementHandle } from "./selectors"

export async function performPageAction(
  context: ScraperExecutionContext,
  action: PageAction,
  pageContext: ScraperPageContext,
) {
  context.logger.info({ msg: "Performing action", action })
  switch (action.type) {
    case PageActionType.Wait:
      await wait(action.duration)
      break
    case PageActionType.Navigate:
      try {
        await pageContext.page.goto(
          await replaceSpecialStrings(action.url, (key) =>
            context.dataBridge.get(key),
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
        await pageContext.page.waitForNavigation({
          waitUntil: "networkidle0",
          signal: context.abortController.signal,
          timeout: 20_000,
        })
      }
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
        await pageContext.page.waitForNavigation({
          waitUntil: "networkidle0",
          signal: context.abortController.signal,
          timeout: 20_000,
        })
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
  }

  await wait(randomInt(1_000, 2_000))

  try {
    await detectAndSolveCaptcha(context, pageContext)
  } catch (error) {
    context.logger.error({ msg: "Captcha detection failed", error })
  }
}
