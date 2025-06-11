import type { NotificationData } from "@web-scraper/common"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { primaryKey, timestamp } from "./helpers"

export const notificationsTable = sqliteTable("notifications", {
  id: primaryKey(),
  createdAt: timestamp("created_at"),
  read: integer({ mode: "boolean" }).notNull().default(false),
  data: text("data", { mode: "json" }).notNull().$type<NotificationData>(),
})
