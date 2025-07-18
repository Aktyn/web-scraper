import { NotificationType } from "@web-scraper/common"
import type { InferInsertModel } from "drizzle-orm"
import type { DbModule } from "../db.module"
import { notificationsTable } from "../schema"

export async function seedNotifications(db: DbModule["db"]) {
  const notifications: InferInsertModel<typeof notificationsTable>[] = []

  for (let i = 0; i < 50; i++) {
    notifications.push({
      data: {
        type: NotificationType.ScraperFinished,
        scraperId: i + 1,
        scraperName: `Scraper ${i + 1}`,
        iterations: Math.floor(Math.random() * 100),
      },
      read: i >= 25,
    })
  }

  await db
    .insert(notificationsTable)
    .values(notifications)
    .onConflictDoNothing()
}
