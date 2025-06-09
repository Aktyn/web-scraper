import { sql } from "drizzle-orm"
import { integer } from "drizzle-orm/sqlite-core"

export function primaryKey() {
  return integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull()
}

export function timestamp(name: string) {
  return integer(name, { mode: "timestamp_ms" })
    .notNull()
    .default(
      sql`(cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer))`,
    )
}

export function sanitizeTableName(name: string) {
  return name.toLowerCase().replace(/(\s+|[^a-zA-Z0-9])/g, "_")
}
