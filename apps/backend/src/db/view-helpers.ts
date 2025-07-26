import { uuid } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"
import { sanitizeTableName } from "./schema/helpers"

export async function createTemporaryView(
  dbModule: DbModule,
  sourceTableName: string,
  whereSQL: string,
) {
  const viewName = sanitizeTableName(`temporary_view_${uuid()}`)

  await dbModule.db
    .run(
      sql`CREATE TEMPORARY VIEW IF NOT EXISTS ${sql.identifier(viewName)} AS SELECT * FROM ${sql.identifier(sourceTableName)} WHERE ${sql.raw(whereSQL)}`,
    )
    .execute()
  return viewName
}

export function removeTemporaryView(dbModule: DbModule, name: string) {
  return dbModule.db
    .run(sql`DROP VIEW IF EXISTS ${sql.identifier(name)}`)
    .execute()
}
