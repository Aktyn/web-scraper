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

async function main() {
  const logger = getLogger()

  logger.info(`Starting application at ${new Date().toUTCString()}`)

  const events = getEventsModule()

  const dbUrl = process.env.DB_FILE_NAME || "file:data.db"

  const db = await getDbModule(dbUrl, logger)

  const config = await getConfig(db)

  const api = await getApiModule({
    db,
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

  return { config, db, api, logger }
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
    const openWebInterface = () => {
      try {
        exec(`open http://localhost:${modules.config.apiPort}`)
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
