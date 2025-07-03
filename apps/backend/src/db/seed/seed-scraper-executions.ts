import {
  ExecutionIteratorType,
  PageActionType,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type ExecutionIterator,
  type ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import type { DbModule } from "../db.module"
import {
  scraperExecutionsTable,
  scraperExecutionIterationsTable,
  scrapersTable,
} from "../schema"

function generateRandomExecutionInfo(): ScraperInstructionsExecutionInfo {
  const hasError = Math.random() > 0.8
  const info: ScraperInstructionsExecutionInfo = [
    {
      type: ScraperInstructionsExecutionInfoType.Instruction,
      instructionInfo: {
        type: ScraperInstructionType.PageAction,
        pageIndex: 0,
        pageUrl: "https://example.com",
        action: {
          type: PageActionType.Wait,
          duration: Math.floor(Math.random() * 1000),
        },
      },
      duration: Math.floor(Math.random() * 500),
    },
  ]

  if (hasError) {
    info.push({
      type: ScraperInstructionsExecutionInfoType.Error,
      errorMessage: "A random error occurred during seeding.",
      summary: { duration: Math.floor(Math.random() * 500) + 500 },
    })
  } else {
    info.push({
      type: ScraperInstructionsExecutionInfoType.Success,
      summary: { duration: Math.floor(Math.random() * 500) + 500 },
    })
  }

  return info
}

export async function seedScraperExecutions(db: DbModule) {
  const scrapers = await db.select({ id: scrapersTable.id }).from(scrapersTable)

  if (!scrapers.length) {
    return
  }

  for (const scraper of scrapers) {
    for (let i = 0; i < 5; i++) {
      const iteratorType =
        i % 2 === 0
          ? ExecutionIteratorType.Range
          : ExecutionIteratorType.EntireSet

      const iterator: ExecutionIterator | null =
        i % 3 === 0
          ? null
          : iteratorType === ExecutionIteratorType.Range
            ? {
                type: ExecutionIteratorType.Range,
                dataSourceName: "products",
                identifier: "id",
                range: i,
              }
            : {
                type: ExecutionIteratorType.EntireSet,
                dataSourceName: "products",
              }
      const newExecutions = await db
        .insert(scraperExecutionsTable)
        .values({
          scraperId: scraper.id,
          iterator,
          createdAt: new Date(new Date().getTime() - 60_000 * i),
        })
        .returning({ id: scraperExecutionsTable.id })
        .get()

      if (!newExecutions) {
        continue
      }

      const info = generateRandomExecutionInfo()
      await db.insert(scraperExecutionIterationsTable).values({
        executionId: newExecutions.id,
        iteration: 1,
        executionInfo: info,
        success:
          info.at(-1)?.type === ScraperInstructionsExecutionInfoType.Success,
      })
    }
  }
}
