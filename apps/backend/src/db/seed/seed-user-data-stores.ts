import { SqliteColumnType } from "@web-scraper/common"
import { type DbModule } from "../db.module"
import { sanitizeTableName } from "../schema/helpers"
import { createUserDataStore } from "../user-data-store-helpers"

export async function seedUserDataStores(db: DbModule) {
  const { table: personalCredentialsTable } = await createUserDataStore(db, {
    tableName: sanitizeTableName("data-store-Personal credentials"),
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

  await createUserDataStore(db, {
    tableName: sanitizeTableName(
      "data-store-Example test of saving page content",
    ),
    name: "Example test of saving page content",
    description: "Example test of saving page content",
    columns: [
      {
        name: "Scraper text",
        type: SqliteColumnType.TEXT,
        notNull: true,
        defaultValue: null,
      },
      {
        name: "Update time",
        type: SqliteColumnType.TIMESTAMP,
        notNull: true,
        defaultValue: 0,
      },
    ],
  })

  const { table: cryptocurrenciesTable } = await createUserDataStore(db, {
    tableName: sanitizeTableName("data-store-Crypto prices"),
    name: "Crypto prices",
    columns: [
      { name: "Cryptocurrency", type: SqliteColumnType.TEXT, notNull: true },
      { name: "Price", type: SqliteColumnType.REAL, notNull: false },
      {
        name: "Last update",
        type: SqliteColumnType.TIMESTAMP,
        notNull: true,
        defaultValue: 0,
      },
    ],
  })

  await db.insert(cryptocurrenciesTable).values([
    {
      Cryptocurrency: "Bitcoin",
      "Last update": new Date(0),
    },
    {
      Cryptocurrency: "Ethereum",
      "Last update": new Date(0),
    },
    {
      Cryptocurrency: "Ethereum Classic",
      "Last update": new Date(0),
    },
    {
      Cryptocurrency: "Monero",
      "Last update": new Date(0),
    },
  ])

  const { table: dataMarkersTable } = await createUserDataStore(db, {
    tableName: sanitizeTableName("data-store-Data markers"),
    name: "Data markers",
    columns: [
      { name: "Name", type: SqliteColumnType.TEXT, notNull: true },
      { name: "Content", type: SqliteColumnType.TEXT },
    ],
  })

  await db
    .insert(dataMarkersTable)
    .values([{ Name: "Last pepper alert", Content: null }])

  await createUserDataStore(db, {
    tableName: sanitizeTableName("data-store-Brain fm accounts"),
    name: "Brain FM accounts",
    columns: [
      { name: "Name", type: SqliteColumnType.TEXT },
      { name: "Email", type: SqliteColumnType.TEXT, notNull: true },
      { name: "Password", type: SqliteColumnType.TEXT, notNull: true },
    ],
  })
}
