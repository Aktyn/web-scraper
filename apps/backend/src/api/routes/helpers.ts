import { RoutineExecutionResult, type ScraperType } from "@web-scraper/common"
import { type InferSelectModel, and, eq } from "drizzle-orm"
import {
  type routineExecutionsTable,
  scraperDataSourcesTable,
  scraperExecutionIterationsTable,
  scraperExecutionsTable,
  type scrapersTable,
} from "../../db/schema"
import type { ApiModuleContext } from "../api.module"

export async function joinScraperWithDataSources(
  db: ApiModuleContext["dbModule"]["db"],
  scraper: InferSelectModel<typeof scrapersTable>,
): Promise<ScraperType> {
  const dataSources = await db
    .select()
    .from(scraperDataSourcesTable)
    .where(eq(scraperDataSourcesTable.scraperId, scraper.id))

  return {
    ...scraper,
    allowOfflineExecution: !!scraper.allowOfflineExecution,
    createdAt: scraper.createdAt.getTime(),
    updatedAt: scraper.updatedAt.getTime(),
    dataSources,
  }
}

export async function getScraperExecutionResult(
  db: ApiModuleContext["dbModule"]["db"],
  executionId: number,
  routineId?: InferSelectModel<typeof routineExecutionsTable>["routineId"],
) {
  const lastExecutionIterationResults = await db
    .select({
      success: scraperExecutionIterationsTable.success,
    })
    .from(scraperExecutionsTable)
    .innerJoin(
      scraperExecutionIterationsTable,
      eq(
        scraperExecutionsTable.id,
        scraperExecutionIterationsTable.executionId,
      ),
    )
    .where(
      and(
        eq(scraperExecutionsTable.id, executionId),
        routineId ? eq(scraperExecutionsTable.routineId, routineId) : undefined,
      ),
    )

  return lastExecutionIterationResults.every(({ success }) => success)
    ? RoutineExecutionResult.Success
    : RoutineExecutionResult.Failed
}
