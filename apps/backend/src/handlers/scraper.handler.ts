import {
  NotificationType,
  runUnsafe,
  ScraperEventType,
  ScraperInstructionsExecutionInfoType,
  ScraperState,
  SubscriptionMessageType,
  waitFor,
  type ExecutionIterator,
  type ScraperType,
  type SimpleLogger,
} from "@web-scraper/common"
import { type PageSnapshot, Scraper } from "@web-scraper/core"
import type { InferSelectModel } from "drizzle-orm"
import path from "node:path"
import type { Logger } from "pino"
import type { Config } from "../config/config"
import { DataBridge } from "../db/data-bridge"
import type { DbModule } from "../db/db.module"
import {
  scraperExecutionIterationsTable,
  scraperExecutionsTable,
} from "../db/schema/scraper-executions.schema"
import type { EventsModule } from "../events/events.module"
import { LOGS_DIRECTORY } from "../logger"
import fs from "node:fs"

const executionQueue: Array<Scraper<{ iteration: number }>> = []

type ScraperExecutorContext = {
  dbModule: DbModule
  logger: Logger | SimpleLogger
  events: EventsModule
  config: Config
  routineId?: number
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

  const queued = Scraper.getInstances().length > 0

  const scraper = new Scraper<{ iteration: number }>({
    id,
    name,
    logger,
    dumpError,
    executablePath:
      context.config.preferences.chromeExecutablePath ||
      "/usr/bin/chromium-browser",
    userDataDir:
      scraperData.userDataDirectory ||
      context.config.preferences.defaultUserDataDirectory ||
      path.resolve(
        process.env.HOME || "~",
        "snap/chromium/common/chromium/Default",
      ),
    headless: context.config.preferences.headless,
    proxy: context.config.preferences.proxyURL,
    plugins: {
      portalUrl: context.config.preferences.portalURL,
      adblocker: context.config.preferences.useAdblockerPlugin,
      stealth: context.config.preferences.useStealthPlugin,
    },
    viewport: {
      width: context.config.preferences.viewportWidth,
      height: context.config.preferences.viewportHeight,
    },
    localizationModel: context.config.preferences.localizationModel,
    localizationSystemPrompt:
      context.config.preferences.localizationSystemPrompt,
    navigationModel: context.config.preferences.navigationModel,

    noInit: queued,
  })

  executionQueue.push(scraper)

  if (queued) {
    logger.warn(
      `Scraper "${name}" is queued for execution because there are other scrapers running. Currently parallel execution is not supported.`,
    )

    context.events.emit("broadcast", {
      type: SubscriptionMessageType.ScraperEvent,
      scraperId: scraper.id,
      event: {
        type: ScraperEventType.StateChange,
        state: ScraperState.Pending,
        previousState: ScraperState.Pending,
      },
    })

    await waitFor(
      () => executionQueue.length === 0 || executionQueue[0] === scraper,
      null,
      1_000,
    )
  }

  const executionRow = await context.dbModule.db
    .insert(scraperExecutionsTable)
    .values({
      scraperId: scraperData.id,
      iterator,
      routineId: context.routineId ?? null,
    })
    .returning()
    .get()

  setupScraperEvents(scraper, { ...context, logger }, executionRow)

  const dataBridge = new DataBridge(
    context.dbModule,
    iterator,
    await DataBridge.buildDataBridgeSources(
      context.dbModule,
      scraperData.dataSources,
    ),
    logger,
  )

  do {
    try {
      await scraper.execute(scraperData.instructions, dataBridge, {
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
        scraperId: scraper.id,
        event: {
          type: ScraperEventType.ExecutionError,
          error: error instanceof Error ? error.message : String(error),
          executionInfo: runUnsafe(() => scraper.executionInfo),
        },
      })
    }
  } while (await dataBridge.nextIteration())

  context.events.emit("notification", {
    type: NotificationType.ScraperFinished,
    scraperId: id,
    scraperName: name,
    iterations: dataBridge.iteration,
  })

  if (!scraper.destroyed) {
    try {
      await scraper.destroy()
    } catch (error) {
      logger.error("Error destroying scraper:", error)
    }
  } else {
    logger.warn({ ms: "Scraper was destroyed unexpectedly" })
  }

  try {
    await dataBridge.destroy()
  } catch (error) {
    logger.error("Error destroying data bridge:", error)
  }

  executionQueue.splice(executionQueue.indexOf(scraper), 1)

  return executionRow.id
}

function setupScraperEvents(
  scraper: Scraper<{ iteration: number }>,
  context: ScraperExecutorContext,
  executionRow: InferSelectModel<typeof scraperExecutionsTable>,
) {
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
  scraper.on("executionFinished", (executionInfo, { iteration }) => {
    const scraperExecutionInfo = executionInfo.get()

    context.dbModule.db
      .insert(scraperExecutionIterationsTable)
      .values({
        iteration,
        executionId: executionRow.id,
        executionInfo: scraperExecutionInfo,
        success:
          scraperExecutionInfo.at(-1)?.type ===
          ScraperInstructionsExecutionInfoType.Success,
      })
      .execute()
      .catch((error) =>
        context.logger.error(
          "Error saving execution info to the database:",
          error,
        ),
      )
      .finally(() =>
        context.events.emit("broadcast", {
          type: SubscriptionMessageType.ScraperEvent,
          scraperId: scraper.id,
          event: {
            type: ScraperEventType.ExecutionFinished,
            executionInfo: scraperExecutionInfo,
          },
        }),
      )
  })
}

function dumpError(error: unknown, pageSnapshots: PageSnapshot[]) {
  const secondsTimestamp = new Date()
    .toISOString()
    .replace(/(.*)T(.*)\.\d+Z/, "$1-$2")
    .replace(/[-:]/g, "")
  const errorDumpDirectory = path.join(
    LOGS_DIRECTORY,
    `error-${secondsTimestamp}`,
  )

  fs.mkdirSync(errorDumpDirectory, { recursive: true })

  fs.writeFileSync(
    path.join(errorDumpDirectory, "error.txt"),
    error instanceof Error ? error.message : String(error),
  )

  for (const pageSnapshot of pageSnapshots) {
    fs.writeFileSync(
      path.join(errorDumpDirectory, `page-${pageSnapshot.pageIndex}.html`),
      pageSnapshot.html,
    )

    fs.writeFileSync(
      path.join(errorDumpDirectory, `page-${pageSnapshot.pageIndex}.jpg`),
      Buffer.from(pageSnapshot.screenshotBase64, "base64"),
    )
  }
}
