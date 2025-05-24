import "dotenv/config"

import { sql } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { getConfig } from "../../config/config"
import { getDbModule } from "../db.module"
import { preferencesTable, userDataStoresTable } from "../schema"
import { primaryKey, sanitizeTableName } from "../schema/helpers"

export async function seed(db = getDbModule(getConfig())) {
  await db.insert(preferencesTable).values({
    key: "foo",
    value: "bar",
  })

  const name = "Personal credentials"
  const tableName = sanitizeTableName(name + "_" + "random_string") //TODO: use randomString(8) when creating user store table from user's request

  await db
    .run(
      sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      origin TEXT NOT NULL,
      username TEXT,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `,
    )
    .execute()

  const personalCredentialsTable = sqliteTable(tableName, {
    id: primaryKey(),
    origin: text("origin").notNull(),
    username: text("username"),
    email: text("email").notNull(),
    password: text("password").notNull(),
  })
  personalCredentialsTable.id.getSQL()

  await db.insert(personalCredentialsTable).values([
    {
      origin: "https://example.com/",
      username: "noop",
      email: "noop@gmail.com",
      password: "Noop123!",
    },
    {
      origin: "https://www.pepper.pl",
      username: "pultetista",
      email: "pultetista@gufum.com",
      password: "pultetista@gufum.com",
    },
  ])

  await db.insert(userDataStoresTable).values({
    tableName,
    name,
    description: "Personal credentials for various websites",
  })
}
