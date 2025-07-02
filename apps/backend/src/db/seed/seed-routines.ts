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

export async function seedRoutines(db: DbModule) {
  const scrapers = await db.select({ id: scrapersTable.id }).from(scrapersTable)

  if (scrapers.length === 0) {
    return
  }

  const routines = Array.from({ length: 10 }, (_, i) => {
    const scraper = scrapers[i % scrapers.length]
    assert(!!scraper, "Scraper not found during seeding")

    const status = RoutineStatus.Active
    const startOffset = randomInt(60_000 * 2, 60_000 * 20)
    const startAt = new Date().getTime() + startOffset

    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: (i + 1) * 10 * 60 * 1000, // minutes to ms
      startAt,
      endAt: i % 3 === 0 ? startAt + randomInt(60_000 * 10, 60_000 * 60) : null,
    }

    return {
      scraperId: scraper.id,
      status,
      description: `Routine number ${i + 1}`,
      scheduler,
      nextScheduledExecutionAt:
        calculateNextScheduledExecutionAt({
          status,
          scheduler,
        }) ?? zeroDate,
      iterator: null,
      pauseAfterNumberOfFailedExecutions: i % 2 === 0 ? 5 : null,
    }
  })

  await db.insert(routinesTable).values(routines)
}

const zeroDate = new Date(0)
