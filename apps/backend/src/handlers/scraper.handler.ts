import {
  runUnsafe,
  ScraperEventType,
  SubscriptionMessageType,
  uuid,
  type ScraperType,
  type SimpleLogger,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { type Logger } from "pino"
import { DataBridge } from "../db/data-bridge"
import { type DbModule } from "../db/db.module"
import { type EventsModule } from "../events/events.module"
import { scraperExecutionInfosTable } from "../db/schema/scraper-execution-infos.schema"

type ScraperExecutorContext = {
  db: DbModule
  logger: Logger | SimpleLogger
  events: EventsModule
}

export async function executeNewScraper(
  scraperId: string,
  scraperData: ScraperType,
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
    await DataBridge.buildDataBridgeSources(
      context.db,
      scraperData.dataSources,
    ),
  )

  const scraper = new Scraper({
    id: scraperId,
    logger,
    userDataDir: scraperData.userDataDirectory ?? undefined,
  })

  scraper.on("stateChange", (state, previousState) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.StateChange,
        state,
        previousState,
      },
    })
  })
  scraper.on("executionStarted", () => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.ExecutionStarted,
      },
    })
  })
  scraper.on("executionUpdate", (update) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.ExecutionUpdate,
        update,
      },
    })
  })
  scraper.on("executingInstruction", (instruction) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.ExecutingInstruction,
        instruction,
      },
    })
  })
  scraper.on("executionFinished", (executionInfo) => {
    context.db
      .insert(scraperExecutionInfosTable)
      .values({
        executionId: uuid(),
        iteration: 1,
        scraperId: scraperData.id,
        executionInfo: executionInfo.get(),
      })
      .execute()
      .catch((error) =>
        logger.error("Error saving execution info to the database:", error),
      )
      .finally(() =>
        context.events.emit("broadcast", {
          type: SubscriptionMessageType.ScraperEvent,
          scraperId: scraper.id,
          event: {
            type: ScraperEventType.ExecutionFinished,
            executionInfo: executionInfo.get(),
          },
        }),
      )
  })

  try {
    await scraper.execute(scraperData.instructions, dataBridge, {
      leavePageOpen: false,
    })

    logger.info("Scraper execution finished")
  } catch (error) {
    logger.error("Error executing scraper:", error)

    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.ExecutionError,
        error: error instanceof Error ? error.message : String(error),
        executionInfo: runUnsafe(() => scraper.executionInfo),
      },
    })
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
