import type {
  ExecutionIterator,
  ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey as primaryKeyColumn, timestamp } from "./helpers"
import { scrapersTable } from "./scrapers.schema"
import { routinesTable } from "./routines.schema"

export const scraperExecutionsTable = sqliteTable("scraper_executions", {
  id: primaryKeyColumn(),
  scraperId: integer("scraper_id")
    .notNull()
    .references(() => scrapersTable.id, { onDelete: "cascade" }),
  iterator: text("iterator", {
    mode: "json",
  }).$type<ExecutionIterator | null>(),
  routineId: integer("routine_id").references(() => routinesTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at"),
})

export const scraperExecutionIterationsTable = sqliteTable(
  "scraper_execution_iterations",
  {
    iteration: integer("iteration", { mode: "number" }).notNull(),
    executionId: integer("execution_id", { mode: "number" })
      .notNull()
      .references(() => scraperExecutionsTable.id, {
        onDelete: "cascade",
      }),
    executionInfo: text("execution_info", { mode: "json" })
      .notNull()
      .$type<ScraperInstructionsExecutionInfo>(),
    success: integer("success", { mode: "boolean" }).notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [primaryKey({ columns: [table.iteration, table.executionId] })],
)
