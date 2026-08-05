import { type SimpleLogger } from "@web-scraper/common"
import type { AutonomousAgent } from "../ai/agent/autonomous-agent"
import type { SmartLocalization } from "../ai/localization/smart-localization"
import type { DataBridge } from "../data-helper"
import type { ExecutionPages } from "./execution-pages"
import type { ScraperExecutionInfo } from "./scraper-execution-info"

export type ScraperExecutionContext = {
  scraperIdentifier: `${number}-${string}`
  pages: ExecutionPages
  dataBridge: DataBridge
  executionInfo: ScraperExecutionInfo
  logger: SimpleLogger
  abortController: AbortController
  ai: {
    localization: SmartLocalization
    navigation: AutonomousAgent
  }
}
