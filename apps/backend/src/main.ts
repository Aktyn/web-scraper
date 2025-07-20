import "dotenv/config"

import { Scraper } from "@web-scraper/core"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { getDbModule } from "./db/db.module"
import { getEventsModule } from "./events/events.module"
import { getLogger } from "./logger"
import { setupSystray } from "./systray"
import { exec } from "node:child_process"
import { startMonitoringRoutines } from "./routines-monitor"
import sea from "node:sea"
import path from "node:path"
import { cwd } from "./cwd"
import { getCliModule } from "./cli/cli.module"

async function main() {
  const logger = getLogger()
  const events = getEventsModule()
  const cli = getCliModule({ logger, events })

  logger.info({ msg: "CLI arguments", args: cli })

  if (cli.cancelRun) {
    return null
  }

  logger.info(`Starting application at ${new Date().toUTCString()}`)

  const dbUrl = cli.inMemoryDatabase
    ? ":memory:"
    : process.env.DB_FILE_NAME ||
      (sea.isSea() ? `file:${path.join(cwd(), "data.db")}` : "file:data.db")

  const dbModule = await getDbModule({ dbUrl, logger })

  const config = await getConfig(dbModule)

  const api = await getApiModule({
    dbModule,
    config,
    logger,
    events,
  })

  api.listen({ port: config.apiPort }, (err, address) => {
    if (err) {
      api.log.error(err)
      process.exit(1)
    }
    logger.info(`Server is now listening on ${address}`)
  })

  logger.info("Setup complete")

  return { config, dbModule, api, logger }
}

const cleanup: NodeJS.SignalsListener = (signal) => {
  Scraper.destroyAll()
  process.exit(signal === "SIGTERM" ? 0 : 1)
}

process.addListener("SIGINT", cleanup)
process.addListener("SIGTERM", cleanup)
process.addListener("SIGQUIT", cleanup)

main()
  .then(async (modules) => {
    if (!modules) {
      return
    }

    const openWebInterface = () => {
      try {
        const port =
          process.env.NODE_ENV === "development" ? 5173 : modules.config.apiPort
        exec(`open http://localhost:${port}`)
      } catch (error) {
        modules.logger.error(error)
      }
    }

    if (process.env.NODE_ENV !== "development") {
      openWebInterface()
    }

    setupSystray(modules, openWebInterface)

    await startMonitoringRoutines(modules)
  })
  .catch((error) => {
    console.error(error)

    cleanup("SIGQUIT")
  })
