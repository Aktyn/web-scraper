import type { SimpleLogger } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import fs from "fs"
import sea from "node:sea"
import path from "path"
import type { Logger } from "pino"
import { joinScraperWithDataSources } from "../api/routes/helpers"
import { cwd } from "../cwd"
import { type DbModule, getDbModule } from "../db/db.module"
import { scrapersTable } from "../db/schema"
import type { EventsModule } from "../events/events.module"
import type { CliArguments } from "./options"

export type CliModuleContext = {
  logger: Logger | SimpleLogger
  events: EventsModule
}

export function initDbForCliCommand(
  cli: CliArguments,
  logger: Logger | SimpleLogger,
) {
  const dbUrl = cli.inMemoryDatabase
    ? ":memory:"
    : process.env.DB_FILE_NAME ||
      (sea.isSea() ? `file:${path.join(cwd(), "data.db")}` : "file:data.db")

  return getDbModule({ dbUrl, logger })
}

export async function loadScraperByName(dbModule: DbModule, name: string) {
  const scraperResponse = await dbModule.db
    .select()
    .from(scrapersTable)
    .where(sql`LOWER(${scrapersTable.name}) LIKE LOWER(${name})`)
    .get()

  if (!scraperResponse) {
    return null
  }

  return await joinScraperWithDataSources(dbModule.db, scraperResponse)
}

export function retrieveJsonFromPathOrString<
  ExpectedType extends object = object,
>(pathOrString: string) {
  if (pathOrString.startsWith("{") && pathOrString.endsWith("}")) {
    try {
      return JSON.parse(pathOrString) as ExpectedType
    } catch {
      // noop
    }
  }

  try {
    return JSON.parse(fs.readFileSync(pathOrString, "utf8")) as ExpectedType
  } catch {
    return null
  }
}
