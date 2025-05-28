import type { SimpleLogger } from "@web-scraper/common"
import { migrate } from "drizzle-orm/libsql/migrator"
import { getApiModule } from "../api/api.module"
import type { Config } from "../config/config"
import { type DbModule, getDbModule } from "../db/db.module"
import { seed } from "../db/seed/seed"
import { vi } from "vitest"

const mockConfig: Config = {
  dbUrl: ":memory:",
  apiPort: 3001,
}

export async function setup() {
  const db = getDbModule(mockConfig)

  // Transactions are not supported in memory database, so we need to mock them
  vi.spyOn(db, "transaction").mockImplementation(
    //@ts-expect-error - mock implementation
    async (callback: (db: DbModule) => Promise<unknown>) => {
      return await callback(db)
    },
  )

  await migrate(db, { migrationsFolder: `${__dirname}/../../drizzle` })
  await seed(db)

  const api = await getApiModule(db, {
    logger: false,
  })

  const logger: SimpleLogger = {
    ...console,
    fatal: console.error,
  }

  return { api, db, logger }
}

export type TestModules = Awaited<ReturnType<typeof setup>>
