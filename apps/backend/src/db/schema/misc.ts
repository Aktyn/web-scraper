import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export const preferencesTable = sqliteTable("preferences_table", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
  // TODO: consider "editable" column to allow users to edit the value from the web interface
})

export const userDataStoresTable = sqliteTable(
  "user_data_stores_table",
  {
    /** Sanitized table name derived from the name of the user data store */
    tableName: text("table_name").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [uniqueIndex("unique_name").on(table.name)],
)
