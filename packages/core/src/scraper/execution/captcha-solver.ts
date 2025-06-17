import { wait } from "@web-scraper/common"
import type { SerializedAXNode } from "rebrowser-puppeteer"
import { getGhostClickOptions, type ScraperExecutionContext } from "./helpers"
import type { ScraperPageContext } from "./execution-pages"

const MAX_ATTEMPTS = 5

export async function detectAndSolveCaptcha(
  context: ScraperExecutionContext,
  pageContext: ScraperPageContext,
  attempt = 1,
) {
  const captchaType = await detectCaptcha(pageContext)

  if (captchaType !== "no-captcha") {
    if (attempt >= MAX_ATTEMPTS) {
      context.logger.info(
        `Captcha has not been solved after ${attempt} attempts, aborting`,
      )

      //TODO: request user to solve captcha manually

      throw new Error("Captcha has not been solved")
    } else if (attempt > 1) {
      context.logger.info(
        `Previous attempt of solving captcha failed. Retrying... (${attempt})`,
      )
    }
  } else {
    return
  }

  switch (captchaType) {
    case "cloudflare-challenge":
      await solveCloudflareChallenge(context, pageContext)

      if (attempt <= MAX_ATTEMPTS) {
        await detectAndSolveCaptcha(context, pageContext, attempt + 1)
      }
      break
  }
}

function detectCaptcha(pageContext: ScraperPageContext) {
  return pageContext.page.evaluate(() => {
    const paragraph = document.querySelector(
      ".main-wrapper > .main-content > p:first-of-type",
    )

    if (
      paragraph?.innerHTML.includes(
        "Verify you are human by completing the action below",
      ) ||
      paragraph?.innerHTML.includes(
        "Verifying you are human. This may take a few seconds",
      )
    ) {
      return "cloudflare-challenge"
    }

    return "no-captcha"
  })
}

async function solveCloudflareChallenge(
  context: ScraperExecutionContext,
  pageContext: ScraperPageContext,
) {
  context.logger.info("Solving Cloudflare challenge")

  const traverse = async (
    nodes: SerializedAXNode[],
    level = 0,
  ): Promise<boolean> => {
    if (!nodes.length) {
      return false
    }

    let clicked = false

    for (const node of nodes) {
      if (node.role === "checkbox" && node.name === "Verify you are human") {
        const handle = await node.elementHandle()

        if (handle) {
          context.logger.info("Clicking checkbox to solve captcha")

          pageContext.cursor.toggleRandomMove(false)
          await pageContext.cursor.click(handle, getGhostClickOptions())
          pageContext.cursor.toggleRandomMove(true)

          clicked = true

          try {
            await pageContext.page.waitForNavigation({
              timeout: 20_000,
              waitUntil: "networkidle0",
              signal: context.abortController.signal,
            })
          } catch {
            // noop
          }
        }
      }

      clicked ||= await traverse(node.children ?? [], level + 1)
    }

    return clicked
  }

  const snapshot = await pageContext.page.accessibility.snapshot({
    includeIframes: true,
  })
  if (snapshot) {
    const clicked = await traverse([snapshot])

    if (clicked) {
      context.logger.info("Captcha checkbox has been clicked")
    } else {
      context.logger.info("Captcha checkbox has not been clicked")
    }
  } else {
    context.logger.warn("No accessibility snapshot found")
  }

  if (context.abortController.signal.aborted) {
    return
  }

  await wait(15_000)

  try {
    await pageContext.page.waitForNetworkIdle({
      timeout: 20_000,
      signal: context.abortController.signal,
    })
  } catch {
    // noop
  }
}
