import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"
import { type Config } from "../config/config"

export function getDbModule(config: Config) {
  const db = drizzle(config.dbUrl, { schema })

  return db
}

export type DbModule = ReturnType<typeof getDbModule>
