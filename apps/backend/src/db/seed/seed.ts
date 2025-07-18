import "dotenv/config"

import { assert, defaultPreferences } from "@web-scraper/common"
import { type DbModule, getDbModule } from "../db.module"
import { preferencesTable } from "../schema"
import { seedScraperExecutions } from "./seed-scraper-executions"
import { seedScrapers } from "./seed-scrapers"
import { seedUserDataStores } from "./seed-user-data-stores"
import { seedNotifications } from "./seed-notifications"
import { seedRoutines } from "./seed-routines"

export async function seed(db?: DbModule["db"]) {
  if (!db) {
    const dbUrl = process.env.DB_FILE_NAME
    assert(!!dbUrl, "DB_FILE_NAME environment variable is not set")
    const dbModule = await getDbModule({ dbUrl })
    db = dbModule.db
  }

  await db
    .insert(preferencesTable)
    .values(
      Object.entries(defaultPreferences).map(([key, { value }]) => ({
        key: key as keyof typeof defaultPreferences,
        value: value,
      })),
    )
    .onConflictDoNothing()

  await seedUserDataStores(db)
  await seedScrapers(db)
  await seedScraperExecutions(db)
  await seedNotifications(db)
  await seedRoutines(db)
}
