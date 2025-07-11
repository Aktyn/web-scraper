import type { SimpleLogger } from "@web-scraper/common"
import { drizzle } from "drizzle-orm/libsql"
import fs from "fs"
import { getDrizzleKitApi } from "./helpers"
import * as schema from "./schema"
import type { Logger } from "pino"
import { IS_TEST_ENV } from "../test/is-test-env"

// eslint-disable-next-line @typescript-eslint/naming-convention
const { pushSQLiteSchema } = getDrizzleKitApi()

export type DatabaseModuleContext = {
  /** :memory: or file:path/to/db.db */
  dbUrl: string
  logger?: Logger | SimpleLogger
}

export async function getDbModule({ dbUrl, logger }: DatabaseModuleContext) {
  const db = drizzle(dbUrl, {
    schema,
    logger: undefined, // new DefaultLogger()
  })

  const shouldPushSchema =
    (dbUrl.startsWith("file:") && !isDatabaseFileReady(dbUrl)) ||
    (dbUrl === ":memory:" && !IS_TEST_ENV)

  if (shouldPushSchema) {
    logger?.info("Database file is not ready, pushing schema")

    try {
      const push = await pushSQLiteSchema(schema, db)
      await push.apply()
    } catch (error) {
      logger?.error("Error pushing schema", error)
      throw error
    }
  }

  return db
}

export type DbModule = Awaited<ReturnType<typeof getDbModule>>

function isDatabaseFileReady(dbUrl: string) {
  const dbPath = dbUrl.replace("file:", "")
  if (fs.existsSync(dbPath)) {
    const fileSize = fs.statSync(dbPath).size
    return fileSize > 1
  }

  return false
}
