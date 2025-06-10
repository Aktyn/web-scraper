import "dotenv/config"

import { assert, defaultPreferences } from "@web-scraper/common"
import { type DbModule, getDbModule } from "../db.module"
import { preferencesTable } from "../schema"
import { seedScraperExecutions } from "./seed-scraper-executions"
import { seedScrapersStores } from "./seed-scrapers"
import { seedUserDataStores } from "./seed-user-data-stores"

export async function seed(db?: DbModule) {
  const dbUrl = process.env.DB_FILE_NAME
  assert(!!dbUrl, "DB_FILE_NAME environment variable is not set")
  db ??= getDbModule(dbUrl)

  await db.insert(preferencesTable).values(
    Object.entries(defaultPreferences).map(([key, { value }]) => ({
      key: key as keyof typeof defaultPreferences,
      value: value,
    })),
  )

  await seedUserDataStores(db)
  await seedScrapersStores(db)
  await seedScraperExecutions(db)
}
