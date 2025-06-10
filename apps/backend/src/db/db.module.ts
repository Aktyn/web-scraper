import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

export function getDbModule(dbUrl: string) {
  const db = drizzle(dbUrl, { schema })
  return db
}

export type DbModule = ReturnType<typeof getDbModule>
