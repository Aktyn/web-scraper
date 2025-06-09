import {
  runUnsafe,
  ScraperEventType,
  SubscriptionMessageType,
  type ExecutionIterator,
  type ScraperType,
  type SimpleLogger,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { type Logger } from "pino"
import { DataBridge } from "../db/data-bridge"
import { type DbModule } from "../db/db.module"
import {
  scraperExecutionsTable,
  scraperExecutionIterationsTable,
} from "../db/schema/scraper-executions.schema"
import { type EventsModule } from "../events/events.module"

type ScraperExecutorContext = {
  db: DbModule
  logger: Logger | SimpleLogger
  events: EventsModule
}

export async function executeNewScraper(
  id: ScraperType["id"],
  name: ScraperType["name"],
  scraperData: ScraperType,
  iterator: ExecutionIterator | null,
  context: ScraperExecutorContext,
) {
  const logger =
    "child" in context.logger
      ? context.logger.child({
          scraper: `${id}-${name}`,
        })
      : context.logger

  const scraper = new Scraper<{ iteration: number }>({
    id,
    name,
    logger,
    userDataDir: scraperData.userDataDirectory ?? undefined,
  })

  scraper.on("stateChange", (state, previousState) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.options.id,
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
      scraperId: scraper.options.id,
      event: {
        type: ScraperEventType.ExecutionStarted,
      },
    })
  })
  scraper.on("executionUpdate", (update) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.options.id,
      event: {
        type: ScraperEventType.ExecutionUpdate,
        update,
      },
    })
  })
  scraper.on("executingInstruction", (instruction) => {
    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.options.id,
      event: {
        type: ScraperEventType.ExecutingInstruction,
        instruction,
      },
    })
  })
  scraper.on("executionFinished", (executionInfo, { iteration }) => {
    context.db
      .insert(scraperExecutionIterationsTable)
      .values({
        iteration,
        executionId: executionRow.id,
        executionInfo: executionInfo.get(),
      })
      .execute()
      .catch((error) =>
        logger.error("Error saving execution info to the database:", error),
      )
      .finally(() =>
        context.events.emit("broadcast", {
          type: SubscriptionMessageType.ScraperEvent,
          scraperId: scraper.options.id,
          event: {
            type: ScraperEventType.ExecutionFinished,
            executionInfo: executionInfo.get(),
          },
        }),
      )
  })

  const executionRow = await context.db
    .insert(scraperExecutionsTable)
    .values({
      scraperId: scraperData.id,
      iterator,
    })
    .returning()
    .get()

  const dataBridge = new DataBridge(
    context.db,
    iterator,
    await DataBridge.buildDataBridgeSources(
      context.db,
      scraperData.dataSources,
    ),
    logger,
  )

  do {
    try {
      await scraper.execute(scraperData.instructions, dataBridge, {
        leavePageOpen: false,
        metadata: {
          iteration: dataBridge.iteration,
        },
      })

      logger.info("Scraper execution finished")
    } catch (error) {
      logger.error(
        `Error executing scraper: ${error instanceof Error ? error.message : String(error)}`,
      )

      context.events.emit("broadcast", {
        type: SubscriptionMessageType.ScraperEvent,
        scraperId: scraper.options.id,
        event: {
          type: ScraperEventType.ExecutionError,
          error: error instanceof Error ? error.message : String(error),
          executionInfo: runUnsafe(() => scraper.executionInfo),
        },
      })
    }
  } while (await dataBridge.nextIteration())

  if (!scraper.destroyed) {
    try {
      scraper.destroy()
    } catch (error) {
      logger.error("Error destroying scraper:", error)
    }
  } else {
    logger.warn("Scraper was destroyed unexpectedly")
  }

  try {
    await dataBridge.destroy()
  } catch (error) {
    logger.error("Error destroying data bridge:", error)
  }
}
