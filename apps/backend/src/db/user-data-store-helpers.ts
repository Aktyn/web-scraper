import { type CreateUserDataStore, randomString, SqliteColumnType } from "@web-scraper/common"
// import { generateSQLiteDrizzleJson, generateSQLiteMigration } from "drizzle-kit/api"
import {
  blob,
  integer,
  numeric,
  real,
  type SQLiteColumnBuilderBase,
  sqliteTable,
  type SQLiteTextJsonBuilderInitial,
  text,
} from "drizzle-orm/sqlite-core"
import type { DbModule } from "./db.module"
import { userDataStoresTable } from "./schema"
import { primaryKey, sanitizeTableName } from "./schema/helpers"

import { createRequire } from "node:module"
//@ts-expect-error temporary fix for drizzle-kit/api
const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const { generateSQLiteDrizzleJson, generateSQLiteMigration } =
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  require("drizzle-kit/api") as typeof import("drizzle-kit/api")

export async function createUserDataStore(
  db: DbModule,
  data: CreateUserDataStore & { tableName?: string },
) {
  const tableName = data.tableName ?? sanitizeTableName(`${data.name}_${randomString(8)}`)

  const columns = data.columns.reduce(
    (acc, columnSchema) => {
      if (columnSchema.name === "id") {
        return acc
      }

      switch (columnSchema.type) {
        case SqliteColumnType.TEXT:
          acc[columnSchema.name] = text(columnSchema.name)
          break
        case SqliteColumnType.NUMERIC:
          acc[columnSchema.name] = numeric(columnSchema.name)
          break
        case SqliteColumnType.REAL:
          acc[columnSchema.name] = real(columnSchema.name)
          break
        case SqliteColumnType.INTEGER:
          acc[columnSchema.name] = integer(columnSchema.name, { mode: "number" })
          break
        case SqliteColumnType.BOOLEAN:
          acc[columnSchema.name] = integer(columnSchema.name, { mode: "boolean" })
          break
        case SqliteColumnType.TIMESTAMP:
          acc[columnSchema.name] = integer(columnSchema.name, { mode: "timestamp" })
          break
        case SqliteColumnType.BLOB:
          acc[columnSchema.name] = blob(columnSchema.name)
          break
      }
      if (columnSchema.notNull) {
        acc[columnSchema.name] = (
          acc[columnSchema.name] as SQLiteTextJsonBuilderInitial<string>
        ).notNull()
      }
      if (columnSchema.defaultValue) {
        acc[columnSchema.name] = (
          acc[columnSchema.name] as SQLiteTextJsonBuilderInitial<string>
        ).default(columnSchema.defaultValue)
      }
      return acc
    },
    {
      id: primaryKey(),
    } as Record<string, SQLiteColumnBuilderBase>,
  )

  const table = sqliteTable(tableName, columns)

  const statementsToExecute = await generateSQLiteMigration(
    await generateSQLiteDrizzleJson({}),
    await generateSQLiteDrizzleJson({ table }),
  )
  for (const statement of statementsToExecute) {
    await db.run(statement).execute()
  }

  const [newStore] = await db
    .insert(userDataStoresTable)
    .values({
      tableName,
      name: data.name,
      description: data.description ?? null,
      columnDefinitions: [
        {
          name: "id",
          type: SqliteColumnType.INTEGER,
          notNull: true,
        },
        ...data.columns.filter((column) => column.name !== "id"),
      ],
    })
    .returning()

  return { tableName, table, newStore }
}
