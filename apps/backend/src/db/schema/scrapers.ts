import type { ScraperInstructions } from "@web-scraper/common"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey } from "./helpers"

export const scrapersTable = sqliteTable("scrapers_table", {
  id: primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  instructions: text("instructions", { mode: "json" }).notNull().$type<ScraperInstructions>(),
  userDataDirectory: text("user_data_directory"),
})
