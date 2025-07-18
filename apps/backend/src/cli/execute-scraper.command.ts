import {
  RoutineExecutionResult,
  type ExecutionIterator,
  type ScraperType,
} from "@web-scraper/common"
import assert from "assert"
import { getScraperExecutionResult } from "../api/routes/helpers"
import type { DbModule } from "../db/db.module"
import { executeNewScraper } from "../handlers/scraper.handler"
import {
  initDbForCliCommand,
  loadScraperByName,
  retrieveJsonFromPathOrString,
  type CliModuleContext,
} from "./helpers"
import type { CliArguments } from "./options"
import { getConfig } from "../config/config"

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function executeScraperCLI(
  commandArguments: CliArguments,
  { logger, events }: CliModuleContext,
) {
  let dbModule: DbModule | null = null

  assert(!!commandArguments.scraper, "Missing --scraper argument")

  let scraper = retrieveJsonFromPathOrString<ScraperType>(
    commandArguments.scraper,
  )

  if (!scraper) {
    dbModule ??= await initDbForCliCommand(commandArguments, logger)

    scraper = await loadScraperByName(dbModule, commandArguments.scraper)
  }

  assert(!!scraper, "Could not load scraper from given source")

  const iterator = commandArguments.iterator
    ? retrieveJsonFromPathOrString<ExecutionIterator>(commandArguments.iterator)
    : null

  dbModule ??= await initDbForCliCommand(commandArguments, logger)
  const config = await getConfig(dbModule)

  try {
    const executionId = await executeNewScraper(
      scraper.id,
      scraper.name,
      scraper,
      iterator,
      {
        dbModule,
        logger,
        events,
        config,
      },
    )

    const result = executionId
      ? await getScraperExecutionResult(dbModule.db, executionId)
      : RoutineExecutionResult.Failed

    logger.info({ msg: "CLI scraper execution finished", result })
  } catch (error) {
    logger.error(error)
  }
}
