import type { SerializedAXNode } from "rebrowser-puppeteer"
import type { ScraperExecutionContext } from "./helpers"
import { randomInt, wait } from "@web-scraper/common"

const MAX_ATTEMPTS = 5

export async function detectAndSolveCaptcha(
  context: ScraperExecutionContext,
  attempt = 1,
) {
  const captchaType = await detectCaptcha(context)

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
  }

  switch (captchaType) {
    case "no-captcha":
      return

    case "cloudflare-challenge":
      await solveCloudflareChallenge(context)

      if (attempt <= MAX_ATTEMPTS) {
        await detectAndSolveCaptcha(context, attempt + 1)
      }
      break
  }
}

function detectCaptcha(context: ScraperExecutionContext) {
  return context.page.evaluate(() => {
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

async function solveCloudflareChallenge(context: ScraperExecutionContext) {
  context.logger.info("Solving Cloudflare challenge")

  const traverse = async (nodes: SerializedAXNode[], level = 0) => {
    if (!nodes.length) {
      return
    }

    for (const node of nodes) {
      if (node.role === "checkbox" && node.name === "Verify you are human") {
        const handle = await node.elementHandle()

        if (handle) {
          context.logger.info("Clicking checkbox to solve captcha")
          await context.cursor.click(handle, {
            randomizeMoveDelay: true,
            moveDelay: 3_000,
            waitForClick: randomInt(10, 200),
            hesitate: randomInt(10, 400),
          })

          try {
            await context.page.waitForNavigation({
              timeout: 20_000,
              waitUntil: "networkidle0",
              signal: context.abortController.signal,
            })

            await wait(10_000)

            await context.page.waitForNetworkIdle({
              timeout: 20_000,
              signal: context.abortController.signal,
            })
          } catch {
            // noop
          }
        }
      }

      await traverse(node.children ?? [], level + 1)
    }
  }

  const snapshot = await context.page.accessibility.snapshot({
    includeIframes: true,
  })
  if (snapshot) {
    await traverse([snapshot])
  }
}
