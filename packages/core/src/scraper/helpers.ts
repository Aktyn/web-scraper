import type { ScraperInstructionsExecutionInfo, SimpleLogger } from "@web-scraper/common"
import type { Page } from "rebrowser-puppeteer"
import type { DataBridge } from "./data-helper"

export type ScraperExecutionContext = {
  page: Page
  dataBridge: DataBridge
  executionInfo: ScraperInstructionsExecutionInfo
  logger: SimpleLogger
}
