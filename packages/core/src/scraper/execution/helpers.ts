import { randomInt, type SimpleLogger } from "@web-scraper/common"
import type { ClickOptions } from "ghost-cursor"
import type { DataBridge } from "../data-helper"
import type { ExecutionPages } from "./execution-pages"
import type { ScraperExecutionInfo } from "./scraper-execution-info"
import type { SmartLocalization } from "../ai/smart-localization"

export type ScraperExecutionContext = {
  scraperIdentifier: `${number}-${string}`
  pages: ExecutionPages
  dataBridge: DataBridge
  executionInfo: ScraperExecutionInfo
  logger: SimpleLogger
  abortController: AbortController
  ai: {
    localization: SmartLocalization
  }
}

export function getGhostClickOptions(): ClickOptions {
  return {
    randomizeMoveDelay: true,
    moveDelay: 3_000,
    waitForClick: randomInt(10, 200),
    hesitate: randomInt(10, 400),
  }
}
