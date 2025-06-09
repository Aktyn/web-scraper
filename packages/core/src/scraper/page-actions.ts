import { wait } from "@web-scraper/common"
import type { ScraperExecutionContext } from "./helpers"

export async function scrollToBottom(context: ScraperExecutionContext) {
  try {
    const pageDownCount =
      (await context.page.evaluate(
        () => document.body.scrollHeight / window.innerHeight,
      )) * 2

    for (let i = 0; i < pageDownCount; i++) {
      await context.page.keyboard.press("PageDown")
      await wait(1000)
    }

    await context.page.keyboard.press("End")
    await wait(500)

    await context.page.evaluate(() => {
      window.scrollBy({
        top: window.document.body.scrollHeight,
        behavior: "smooth",
      })
    })
    await wait(500)

    await context.page.evaluate(async () => {
      let scrollPosition = 0
      let documentHeight = document.body.scrollHeight

      const start = Date.now()

      while (documentHeight > scrollPosition && Date.now() - start < 10_000) {
        window.scrollBy({ top: documentHeight, behavior: "smooth" })
        await new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        scrollPosition = documentHeight
        documentHeight = document.body.scrollHeight
      }
    })

    context.logger.info("Scrolled to the bottom of the page.")
  } catch (error) {
    context.logger.warn(
      "An error occurred while scrolling to the bottom of the page.",
    )
    context.logger.warn(error)
  }
}
