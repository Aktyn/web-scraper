import type { UserDataStoreColumn } from "@web-scraper/common"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const userDataStoresTable = sqliteTable("user_data_stores_table", {
  /** Sanitized table name derived from the name of the user data store */
  tableName: text("table_name").primaryKey().notNull(),
  name: text("name").notNull().unique(),
  description: text("description"),
  /** Should include the id column */
  columnDefinitions: text("column_definitions", { mode: "json" })
    .notNull()
    .$type<Array<UserDataStoreColumn>>(),
})
