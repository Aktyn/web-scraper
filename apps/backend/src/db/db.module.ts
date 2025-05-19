import { drizzle } from "drizzle-orm/libsql"
import type { Config } from "../config/config"
import * as schema from "./schema"

export function getDbModule(config: Config) {
  const db = drizzle(config.dbUrl, { schema })
  return db
}

export type DbModule = ReturnType<typeof getDbModule>
