import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import type { defaultPreferences } from "@web-scraper/common"

export const preferencesTable = sqliteTable("preferences", {
  key: text("key")
    .$type<keyof typeof defaultPreferences>()
    .primaryKey()
    .notNull(),
  value: text("value", { mode: "json" }).$type<Required<unknown>>().notNull(),
})
