import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey, timestamp } from "./helpers"
import { routinesTable } from "./routines.schema"
import type { RoutineExecutionResult } from "@web-scraper/common"

export const routineExecutionsTable = sqliteTable("routine_executions", {
  id: primaryKey(),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routinesTable.id, { onDelete: "cascade" }),
  result: text("result").$type<RoutineExecutionResult>(),
  createdAt: timestamp("created_at"),
})
