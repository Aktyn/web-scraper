import type { ScraperInstructions } from "@web-scraper/common"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey, timestamp } from "./helpers"

export const scrapersTable = sqliteTable("scrapers", {
  id: primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  instructions: text("instructions", { mode: "json" })
    .notNull()
    .$type<ScraperInstructions>(),
  userDataDirectory: text("user_data_directory"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
})
