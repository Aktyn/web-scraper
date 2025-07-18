import {
  type Scheduler,
  assert,
  calculateNextScheduledExecutionAt,
  randomInt,
  RoutineStatus,
  SchedulerType,
} from "@web-scraper/common"
import type { DbModule } from "../db.module"
import { routinesTable, scrapersTable } from "../schema"

export async function seedRoutines(db: DbModule["db"]) {
  const scrapers = await db.select({ id: scrapersTable.id }).from(scrapersTable)

  if (scrapers.length === 0) {
    return
  }

  const routines = Array.from({ length: 10 }, (_, i) => {
    const scraper = scrapers[i % scrapers.length]
    assert(!!scraper, "Scraper not found during seeding")

    const status = RoutineStatus.Paused
    const MINUTE = 60_000
    const HOUR = MINUTE * 60
    const startOffset = randomInt(MINUTE * 5, HOUR)
    const startAt = new Date().getTime() + startOffset

    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: MINUTE * randomInt(30, 120),
      startAt,
      endAt: i % 3 === 0 ? startAt + randomInt(HOUR, HOUR * 2) : null,
    }

    return {
      scraperId: scraper.id,
      status,
      description: `Routine number ${i + 1}`,
      scheduler,
      nextScheduledExecutionAt:
        calculateNextScheduledExecutionAt(
          {
            status,
            scheduler,
          },
          null,
        ) ?? zeroDate,
      lastExecutionAt: null,
      iterator: null,
      pauseAfterNumberOfFailedExecutions: i % 2 === 0 ? 5 : null,
    }
  })

  await db.insert(routinesTable).values(routines).onConflictDoNothing()
}

const zeroDate = new Date(0)
