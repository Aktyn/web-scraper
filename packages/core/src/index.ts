// Polyfills
import "kind-of"
import "is-plain-object"
import "shallow-clone"

// Core exports
export type { DataBridge, DataBridgeValue } from "./scraper/data-helper"
export type { PageSnapshot } from "./scraper/execution/execution-pages"
export { ScraperExecutionInfo } from "./scraper/execution/scraper-execution-info"
export { Scraper } from "./scraper/scraper"
export { checkModelAvailability } from "./scraper/ai/helpers"
