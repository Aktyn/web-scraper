import type { ScraperInstructions } from "@web-scraper/common"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey, timestamp } from "./helpers"

export const scrapersTable = sqliteTable("scrapers", {
  id: primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  instructions: text("instructions", { mode: "json" })
    .notNull()
    .$type<ScraperInstructions>(),
  userDataDirectory: text("user_data_directory"),
  allowOfflineExecution: integer("allow_offline_execution", {
    mode: "boolean",
  }).default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at", true),
})
