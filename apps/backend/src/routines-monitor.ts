import { RoutineStatus, type SimpleLogger } from "@web-scraper/common"
import type { Logger } from "pino"
import type { DbModule } from "./db/db.module"
import { routinesTable } from "./db/schema"
import { eq } from "drizzle-orm"

type Context = {
  logger: Logger | SimpleLogger
  db: DbModule
}

export async function startMonitoringRoutines({ logger, db }: Context) {
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

  //TODO: monitor routines and execute them if they are due
}
