import "dotenv/config"

import { Scraper } from "@web-scraper/core"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { getDbModule } from "./db/db.module"
import { getEventsModule } from "./events/events.module"
import { getLogger } from "./logger"
import { assert } from "@web-scraper/common"

async function main() {
  const logger = getLogger()

  logger.info(`Starting application at ${new Date().toUTCString()}`)

  const events = getEventsModule()

  const dbUrl = process.env.DB_FILE_NAME
  assert(!!dbUrl, "DB_FILE_NAME environment variable is not set")

  const db = getDbModule(dbUrl)

  const config = await getConfig(db)

  const api = await getApiModule({ db, config, logger, events })

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

const cleanup = async () => {
  Scraper.destroyAll()
  process.exit(0)
}

process.addListener("SIGINT", cleanup)
process.addListener("SIGTERM", cleanup)
process.addListener("SIGQUIT", cleanup)

main()
  .then(async (_modules) => {
    // await testRun(_modules.db, _modules.logger)
  })
  .catch((error) => {
    void cleanup()

    console.error(error)
    process.exit(1)
  })
