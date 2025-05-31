import type { SimpleLogger } from "@web-scraper/common"
import type { Page } from "rebrowser-puppeteer"
import type { DataBridge } from "./data-helper"
import type { ScraperExecutionInfo } from "./scraper-execution-info"

export type ScraperExecutionContext = {
  page: Page
  dataBridge: DataBridge
  executionInfo: ScraperExecutionInfo
  logger: SimpleLogger
}
