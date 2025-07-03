import type { ScraperType } from "@web-scraper/common"
import { type InferSelectModel, eq } from "drizzle-orm"
import { type scrapersTable, scraperDataSourcesTable } from "../../db/schema"
import type { ApiModuleContext } from "../api.module"

export async function joinScraperWithDataSources(
  db: ApiModuleContext["db"],
  scraper: InferSelectModel<typeof scrapersTable>,
): Promise<ScraperType> {
  const dataSources = await db
    .select()
    .from(scraperDataSourcesTable)
    .where(eq(scraperDataSourcesTable.scraperId, scraper.id))

  return {
    ...scraper,
    createdAt: scraper.createdAt.getTime(),
    updatedAt: scraper.updatedAt.getTime(),
    dataSources,
  }
}
