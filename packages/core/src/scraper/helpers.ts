import { type SpecialStringContext, randomString } from "@web-scraper/common"
import dns from "dns"
import fs from "fs"
import path from "path"
import type { Page } from "rebrowser-puppeteer"
import type { ScraperExecutionContext } from "./execution/helpers"

export async function saveScreenshot(page: Page, fileNamePrefix: string) {
  const screenshot = await page.screenshot({
    type: "jpeg",
    quality: 80,
    fullPage: true,
  })

  const screenshotDir = path.join(process.cwd(), "screenshots")
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }

  const screenshotPath = path.join(
    screenshotDir,
    `${fileNamePrefix}-${randomString(8)}.jpeg`,
  )

  await fs.promises.writeFile(screenshotPath, screenshot)
}

export function buildSpecialStringContext(
  context: Pick<ScraperExecutionContext, "logger" | "pages" | "dataBridge">,
): SpecialStringContext {
  return {
    logger: context.logger,
    getExternalData: (key) => context.dataBridge.get(key),
    getPageUrl: (pageIndex) =>
      context.pages.getPage(pageIndex ?? 0, false)?.url() ?? null,
  }
}

export async function checkNetworkConnection(): Promise<boolean> {
  const hostnames = ["google.com", "cloudflare.com", "facebook.com"]

  for (const hostname of hostnames) {
    try {
      await new Promise<void>((resolve, reject) => {
        dns.lookup(hostname, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
      return true
    } catch {
      // Continue to the next hostname if the current one fails
    }
  }

  return false
}
