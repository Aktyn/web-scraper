import {
  PageActionType,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  uuid,
  type ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import type { DbModule } from "../db.module"
import { scraperExecutionInfosTable, scrapersTable } from "../schema"

function generateRandomExecutionInfo(): ScraperInstructionsExecutionInfo {
  const hasError = Math.random() > 0.8
  const info: ScraperInstructionsExecutionInfo = [
    {
      type: ScraperInstructionsExecutionInfoType.Instruction,
      instructionInfo: {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: Math.floor(Math.random() * 1000),
        },
      },
      url: "https://example.com",
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

export async function seedScraperExecutionInfos(db: DbModule) {
  const scrapers = await db.select({ id: scrapersTable.id }).from(scrapersTable)

  if (!scrapers.length) {
    return
  }

  const values: (typeof scraperExecutionInfosTable.$inferInsert)[] = []

  for (const scraper of scrapers) {
    for (let i = 0; i < 5; i++) {
      values.push({
        scraperId: scraper.id,
        executionId: uuid(),
        iteration: 1,
        executionInfo: generateRandomExecutionInfo(),
      })
    }
  }

  await db.insert(scraperExecutionInfosTable).values(values)
}
