import { integer } from "drizzle-orm/sqlite-core"

export function primaryKey() {
  return integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull()
}

export function sanitizeTableName(name: string) {
  return name.toLowerCase().replace(/(\s+|[^a-zA-Z0-9])/g, "_")
}
