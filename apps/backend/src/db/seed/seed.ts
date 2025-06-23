import "dotenv/config"

import { assert, defaultPreferences } from "@web-scraper/common"
import { type DbModule, getDbModule } from "../db.module"
import { preferencesTable } from "../schema"
import { seedScraperExecutions } from "./seed-scraper-executions"
import { seedScrapers } from "./seed-scrapers"
import { seedUserDataStores } from "./seed-user-data-stores"
import { seedNotifications } from "./seed-notifications"

export async function seed(db?: DbModule) {
  if (!db) {
    const dbUrl = process.env.DB_FILE_NAME
    assert(!!dbUrl, "DB_FILE_NAME environment variable is not set")
    db = await getDbModule(dbUrl)
  }

  await db.insert(preferencesTable).values(
    Object.entries(defaultPreferences).map(([key, { value }]) => ({
      key: key as keyof typeof defaultPreferences,
      value: value,
    })),
  )

  await seedUserDataStores(db)
  await seedScrapers(db)
  await seedScraperExecutions(db)
  await seedNotifications(db)
}
