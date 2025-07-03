import { RoutineStatus, wait, type SimpleLogger } from "@web-scraper/common"
import { and, asc, eq, lte } from "drizzle-orm"
import type { Logger } from "pino"
import type { ApiModule } from "./api/api.module"
import type { DbModule } from "./db/db.module"
import { routinesTable } from "./db/schema"

const CHECK_INTERVAL = 1000 * 60 // 1 minute

type Context = {
  logger: Logger | SimpleLogger
  db: DbModule
  api: ApiModule
}

export async function startMonitoringRoutines(
  { logger, db, api }: Context,
  abortSignal?: AbortSignal,
) {
  // Fix routines that were executing when the backend was restarted
  const result = await db
    .update(routinesTable)
    .set({ status: RoutineStatus.Active })
    .where(eq(routinesTable.status, RoutineStatus.Executing))

  if (result.rowsAffected > 0) {
    logger.info(
      `${result.rowsAffected} routines were executing when the backend was restarted and were set back to active`,
    )
  }

  while (abortSignal ? !abortSignal.aborted : true) {
    const routinesToExecute = await db
      .select()
      .from(routinesTable)
      .where(
        and(
          eq(routinesTable.status, RoutineStatus.Active),
          lte(routinesTable.nextScheduledExecutionAt, new Date()),
        ),
      )
      .orderBy(asc(routinesTable.nextScheduledExecutionAt))
      .limit(256) // Limit to prevent too many simultaneous scraper executions

    for (const routine of routinesToExecute) {
      logger.info(
        `Executing routine ${routine.id} that was scheduled to run at ${routine.nextScheduledExecutionAt.getTime()}`,
      )
      await api
        .inject({
          method: "POST",
          url: `/routines/${routine.id}/execute`,
        })
        .catch(logger.error)

      await wait(1_000)
    }

    await wait(CHECK_INTERVAL)
  }
}
