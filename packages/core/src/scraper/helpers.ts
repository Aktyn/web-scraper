import { randomInt, randomString, type SimpleLogger } from "@web-scraper/common"
import fs from "fs"
import type { ClickOptions, GhostCursor } from "ghost-cursor"
import path from "path"
import type { Page } from "rebrowser-puppeteer"
import type { DataBridge } from "./data-helper"
import type { ScraperExecutionInfo } from "./scraper-execution-info"

export type ScraperExecutionContext = {
  page: Page
  cursor: GhostCursor
  dataBridge: DataBridge
  executionInfo: ScraperExecutionInfo
  logger: SimpleLogger
  abortController: AbortController
}

export async function saveScreenshot(
  page: Page,
  scraperIdentifier: `${number}-${string}`,
) {
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
    `${scraperIdentifier}-${randomString(10)}.jpeg`,
  )

  await fs.promises.writeFile(screenshotPath, screenshot)
}

export function getGhostClickOptions(): ClickOptions {
  return {
    randomizeMoveDelay: true,
    moveDelay: 3_000,
    waitForClick: randomInt(10, 200),
    hesitate: randomInt(10, 400),
  }
}
