import { integer } from "drizzle-orm/sqlite-core"

export function primaryKey() {
  return integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }).notNull()
}

export function sanitizeTableName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "_")
}
