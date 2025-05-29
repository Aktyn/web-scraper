import { uuid } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"
import { sanitizeTableName } from "./schema/helpers"

export async function createTemporaryView(db: DbModule, sourceTableName: string, whereSQL: string) {
  const viewName = sanitizeTableName(`temporary_view_${uuid()}`)

  await db
    .run(
      sql.raw(
        `CREATE TEMPORARY VIEW IF NOT EXISTS ${viewName} AS SELECT * FROM ${sourceTableName} WHERE ${whereSQL}`,
      ),
    )
    .execute()
  return viewName
}

export function removeTemporaryView(db: DbModule, name: string) {
  return db.run(sql`DROP VIEW IF EXISTS ${sql.identifier(name)}`).execute()
}
