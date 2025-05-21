import { migrate } from "drizzle-orm/libsql/migrator"
import { getApiModule } from "../api/api.module"
import type { Config } from "../config/config"
import { getDbModule } from "../db/db.module"
import { seed } from "../db/seed/seed"

const mockConfig: Config = {
  dbUrl: ":memory:",
  apiPort: 3001,
}

export async function setup() {
  const db = getDbModule(mockConfig)
  await migrate(db, { migrationsFolder: `${__dirname}/../../drizzle` })
  await seed(db)

  const api = await getApiModule(db, {
    logger: false,
  })

  return { api, db }
}

export type TestModules = Awaited<ReturnType<typeof setup>>
