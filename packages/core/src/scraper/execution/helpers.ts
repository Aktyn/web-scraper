import { randomInt, type SimpleLogger } from "@web-scraper/common"
import type { ClickOptions } from "ghost-cursor"
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
}

export function getGhostClickOptions(): ClickOptions {
  return {
    randomizeMoveDelay: true,
    moveDelay: 3_000,
    waitForClick: randomInt(10, 200),
    hesitate: randomInt(10, 400),
  }
}

//TODO: remove if not needed
// export async function waitForNetworkIdle(context: ScraperExecutionContext) {
//   try {
//     await context.page.waitForNetworkIdle({
//       timeout: 20_000,
//       signal: context.abortController.signal,
//     })
//   } catch (error) {
//     context.logger.warn({ msg: "Network idle timeout", error })
//   }
// }
