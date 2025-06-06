import "dotenv/config"

import { getConfig } from "../../config/config"
import { getDbModule } from "../db.module"
import { preferencesTable } from "../schema"
import { seedScrapersStores } from "./seed-scrapers"
import { seedUserDataStores } from "./seed-user-data-stores"
import { seedScraperExecutionInfos } from "./seed-scraper-execution-infos"

export async function seed(db = getDbModule(getConfig())) {
  await db.insert(preferencesTable).values({
    key: "foo",
    value: "bar",
  })

  await seedUserDataStores(db)
  await seedScrapersStores(db)
  await seedScraperExecutionInfos(db)
}
