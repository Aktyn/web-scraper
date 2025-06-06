import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core"
import { scrapersTable } from "./scrapers.schema"
import { relations, sql } from "drizzle-orm"

export const scraperExecutionInfosTable = sqliteTable(
  "scraper_execution_infos",
  {
    executionId: text("execution_id").notNull(),
    iteration: integer("iteration").notNull(),
    scraperId: integer("scraper_id")
      .notNull()
      .references(() => scrapersTable.id, { onDelete: "cascade" }),
    executionInfo: text("execution_info", { mode: "json" })
      .notNull()
      .$type<ScraperInstructionsExecutionInfo>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(
        sql`(cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer))`,
      ),
  },
  (table) => [primaryKey({ columns: [table.executionId, table.iteration] })],
)

export const scraperExecutionInfosRelations = relations(
  scraperExecutionInfosTable,
  ({ one }) => ({
    scraper: one(scrapersTable, {
      fields: [scraperExecutionInfosTable.scraperId],
      references: [scrapersTable.id],
    }),
  }),
)
