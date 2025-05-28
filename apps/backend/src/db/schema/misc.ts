import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const preferencesTable = sqliteTable("preferences_table", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
  // TODO: consider "editable" column to allow users to edit the value from the web interface
})
