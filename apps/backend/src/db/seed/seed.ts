import "dotenv/config"

import { getConfig } from "../../config/config"
import { getDbModule } from "../db.module"
import { preferencesTable } from "../schema"
import { sanitizeTableName } from "../schema/helpers"
import { createUserDataStore } from "../user-data-store-helpers"
import { SqliteColumnType } from "@web-scraper/common"

export async function seed(db = getDbModule(getConfig())) {
  await db.insert(preferencesTable).values({
    key: "foo",
    value: "bar",
  })

  const { table: personalCredentialsTable } = await createUserDataStore(db, {
    tableName: sanitizeTableName("Personal credentials random string"),
    name: "Personal credentials",
    description: "Personal credentials for various websites",
    columns: [
      {
        name: "origin",
        type: SqliteColumnType.TEXT,
        notNull: true,
      },
      {
        name: "username",
        type: SqliteColumnType.TEXT,
      },
      {
        name: "email",
        type: SqliteColumnType.TEXT,
      },
      {
        name: "password",
        type: SqliteColumnType.TEXT,
        notNull: true,
      },
    ],
  })

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
}
