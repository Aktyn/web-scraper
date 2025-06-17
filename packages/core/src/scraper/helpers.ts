import { randomString } from "@web-scraper/common"
import fs from "fs"
import path from "path"
import type { Page } from "rebrowser-puppeteer"

export async function saveScreenshot(page: Page, fileNamePrefix: string) {
  const screenshot = await page.screenshot({
    type: "jpeg",
    quality: 80,
    fullPage: true,
  })

  const screenshotDir = path.join(__dirname, "..", "..", "screenshots")
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }

  const screenshotPath = path.join(
    screenshotDir,
    `${fileNamePrefix}-${randomString(8)}.jpeg`,
  )

  await fs.promises.writeFile(screenshotPath, screenshot)
}
