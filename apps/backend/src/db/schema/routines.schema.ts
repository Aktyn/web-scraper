import {
  RoutineStatus,
  type ExecutionIterator,
  type Scheduler,
} from "@web-scraper/common"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey, timestamp } from "./helpers"
import { scrapersTable } from "./scrapers.schema"

export const routinesTable = sqliteTable("routines", {
  id: primaryKey(),
  scraperId: integer("scraper_id")
    .notNull()
    .references(() => scrapersTable.id, { onDelete: "cascade" }),
  iterator: text("iterator", {
    mode: "json",
  }).$type<ExecutionIterator | null>(),
  status: text("status")
    .notNull()
    .$type<RoutineStatus>()
    .default(RoutineStatus.Active),
  description: text("description"),
  scheduler: text("scheduler", { mode: "json" }).notNull().$type<Scheduler>(),
  /** Zero timestamp means that the routine has no next scheduled execution */
  nextScheduledExecutionAt: integer("next_scheduled_execution_at", {
    mode: "timestamp_ms",
  }).notNull(),
  pauseAfterNumberOfFailedExecutions: integer(
    "pause_after_number_of_failed_executions",
  ),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at", true),
})
