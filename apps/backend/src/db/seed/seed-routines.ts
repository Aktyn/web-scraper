import { assert, RoutineStatus, SchedulerType } from "@web-scraper/common"
import type { DbModule } from "../db.module"
import { routinesTable, scrapersTable } from "../schema"

export async function seedRoutines(db: DbModule) {
  const scrapers = await db.select({ id: scrapersTable.id }).from(scrapersTable)

  if (scrapers.length === 0) {
    return
  }

  const routines = Array.from({ length: 10 }, (_, i) => {
    const scraper = scrapers[i % scrapers.length]
    assert(!!scraper, "Scraper not found during seeding")

    return {
      scraperId: scraper.id,
      status: RoutineStatus.Active,
      description: `Routine number ${i + 1}`,
      scheduler: {
        type: SchedulerType.Interval,
        interval: (i + 1) * 10 * 60 * 1000, // minutes to ms
        startAt: new Date().getTime(),
        endAt: i % 2 === 0 ? new Date().getTime() + 10 * 60 * 1000 : null,
      },
      iterator: null,
      pauseAfterNumberOfFailedExecutions: i % 2 === 0 ? 5 : null,
    }
  })

  await db.insert(routinesTable).values(routines)
}
