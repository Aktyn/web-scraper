import type { SimpleLogger } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql"
import fs from "fs"
import type { Logger } from "pino"
import { IS_TEST_ENV } from "../test/is-test-env"
import { getDrizzleKitApi } from "./helpers"
import * as schema from "./schema"
import { seed } from "./seed/seed"

// eslint-disable-next-line @typescript-eslint/naming-convention
const { pushSQLiteSchema } = getDrizzleKitApi()

export type DatabaseModuleContext = {
  /** :memory: or file:path/to/db.db */
  dbUrl: string
  logger?: Logger | SimpleLogger
}

export async function getDbModule({ dbUrl, logger }: DatabaseModuleContext) {
  const db = initDatabase(dbUrl)

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

  const resetDatabase = async () => {
    logger?.info("Resetting database")

    await db.transaction(async (tx) => {
      for (let pass = 0; pass < 16; pass++) {
        const schemaObjects: Array<{ type: string; name: string }> =
          await tx.all(
            sql`select type, name from sqlite_schema where name not like 'sqlite_%' order by random()`,
          )

        if (!schemaObjects.length) {
          break
        }

        for (const { type, name } of schemaObjects) {
          try {
            if (pass % 2 === 0) {
              await tx.run(
                sql.raw(`
                  PRAGMA foreign_keys = OFF;
                  drop ${type} if exists "${name}";
                  PRAGMA foreign_keys = ON;
                  `),
              )
            } else {
              await tx.run(sql.raw(`drop ${type} if exists "${name}";`))
            }
          } catch (error) {
            logger?.error({
              msg: `Error executing \`drop ${type} if exists "${name}"\``,
              error,
            })
          }
        }
      }
    })

    await db.run(sql`VACUUM`)

    const push = await pushSQLiteSchema(schema, db)
    await push.apply()
  }

  const seedDatabase = async () => {
    logger?.info("Seeding database")

    await seed(db)
  }

  return { db, resetDatabase, seedDatabase }
}

export type DbModule = Awaited<ReturnType<typeof getDbModule>>

function initDatabase(url: string) {
  return drizzle(url, {
    schema,
    logger: undefined, // new DefaultLogger()
  })
}

function isDatabaseFileReady(dbUrl: string) {
  const dbPath = dbUrl.replace("file:", "")
  if (fs.existsSync(dbPath)) {
    const fileSize = fs.statSync(dbPath).size
    return fileSize > 1
  }

  return false
}
