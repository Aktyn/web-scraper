import { type SimpleLogger } from "@web-scraper/common"
import { migrate } from "drizzle-orm/libsql/migrator"
import path from "path"
import { vi } from "vitest"
import { getApiModule } from "../api/api.module"
import { getDefaultPreferences, type Config } from "../config/config"
import { cwd } from "../cwd"
import { getDbModule, type DbModule } from "../db/db.module"
import { seed } from "../db/seed/seed"
import { getEventsModule } from "../events/events.module"

const mockConfig: Config = {
  apiPort: 3001,
  preferences: getDefaultPreferences(),
  updatePreferences: (key, value) => {
    mockConfig.preferences[key] = value
  },
  resetPreferences: () => {
    mockConfig.preferences = getDefaultPreferences()
  },
}

export async function setup() {
  const logger: SimpleLogger = {
    ...console,
    fatal: console.error,
  }

  const db = await getDbModule({ dbUrl: ":memory:", logger })

  // Transactions are not supported in memory database, so we need to mock them
  vi.spyOn(db, "transaction").mockImplementation(
    //@ts-expect-error - mock implementation
    async (callback: (db: DbModule) => Promise<unknown>) => {
      return await callback(db)
    },
  )

  await migrate(db, { migrationsFolder: path.join(cwd(), "drizzle") })
  await seed(db)

  const events = getEventsModule()

  const api = await getApiModule(
    { db, logger, config: mockConfig, events },
    {
      logger: false,
    },
  )

  return { api, db, logger, events, config: mockConfig }
}

export type TestModules = Awaited<ReturnType<typeof setup>>
