import { wait } from "@web-scraper/common"
import type { ScraperExecutionContext } from "./helpers"
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

  const checkbox = pageContext.page.locator(
    'input[type="checkbox"], .cf-turnstile, [id*="turnstile"]',
  )

  try {
    const count = await checkbox.count()
    if (count > 0) {
      context.logger.info("Clicking checkbox to solve captcha")
      await checkbox.first().click({ force: true })

      try {
        await pageContext.page.waitForURL("**", {
          timeout: 20_000,
          waitUntil: "networkidle",
        })
      } catch {
        // noop
      }
    } else {
      context.logger.info("Captcha checkbox not found via locator")
    }
  } catch (error) {
    context.logger.warn({ msg: "Failed to click captcha checkbox", error })
  }

  if (context.abortController.signal.aborted) {
    return
  }

  await wait(15_000)

  try {
    await pageContext.page.waitForLoadState("networkidle", {
      timeout: 20_000,
    })
  } catch {
    // noop
  }
}
