import type { SimpleLogger } from "@web-scraper/common"
import { drizzle } from "drizzle-orm/libsql"
import fs from "fs"
import * as schema from "./schema"
import { getDrizzleKitApi } from "./helpers"

// eslint-disable-next-line @typescript-eslint/naming-convention
const { pushSQLiteSchema } = getDrizzleKitApi()

export async function getDbModule(dbUrl: string, logger?: SimpleLogger) {
  const db = drizzle(dbUrl, { schema })

  if (dbUrl.startsWith("file:") && !isDatabaseFileReady(dbUrl)) {
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
