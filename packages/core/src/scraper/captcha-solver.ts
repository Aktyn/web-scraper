import type { SerializedAXNode } from "rebrowser-puppeteer"
import type { ScraperExecutionContext } from "./helpers"

export async function detectAndSolveCaptcha(context: ScraperExecutionContext) {
  const captchaType = await context.page.evaluate(() => {
    const paragraph = document.querySelector(
      ".main-wrapper > .main-content > p:first-of-type",
    )

    if (
      paragraph?.innerHTML.includes(
        "Verify you are human by completing the action below",
      )
    ) {
      return "cloudflare-challenge"
    }

    return "no-captcha"
  })

  switch (captchaType) {
    case "no-captcha":
      return

    case "cloudflare-challenge":
      await solveCloudflareChallenge(context)
      break
  }
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
            moveDelay: 1000,
          })

          try {
            await context.page.waitForNetworkIdle({
              timeout: 10_000,
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
