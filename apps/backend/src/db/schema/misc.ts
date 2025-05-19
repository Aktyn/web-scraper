import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const preferencesTable = sqliteTable("preferences_table", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
})
