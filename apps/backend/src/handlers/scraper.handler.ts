import { type ScraperType, type SimpleLogger } from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { type Logger } from "pino"
import { DataBridge } from "../db/data-bridge"
import { type DbModule } from "../db/db.module"
import { type EventsModule } from "../events/events.module"

type ScraperExecutorContext = {
  db: DbModule
  logger: Logger | SimpleLogger
  events: EventsModule
}

export async function executeNewScraper(
  scraperId: string,
  data: ScraperType,
  context: ScraperExecutorContext,
) {
  const logger =
    "child" in context.logger
      ? context.logger.child({
          scraper: scraperId,
        })
      : context.logger

  const dataBridge = new DataBridge(
    context.db,
    await DataBridge.buildDataBridgeSources(context.db, data.dataSources),
  )

  const scraper = new Scraper({
    id: scraperId,
    logger,
    userDataDir: data.userDataDirectory ?? undefined,
  })

  try {
    const executionInfo = await scraper.execute(data.instructions, dataBridge, {
      leavePageOpen: false,
    })
    console.info(executionInfo.get()) //TODO: save execution info to the database for later analysis (make it cascade delete with scraper)
    logger.info("Scraper execution finished")
  } catch (error) {
    logger.error("Error executing scraper:", error)
  }

  try {
    scraper.destroy()
  } catch (error) {
    logger.error("Error destroying scraper:", error)
  }

  try {
    await dataBridge.destroy()
  } catch (error) {
    logger.error("Error destroying data bridge:", error)
  }
}
