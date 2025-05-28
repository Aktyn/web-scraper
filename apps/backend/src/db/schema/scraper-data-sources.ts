import type { WhereSchema } from "@web-scraper/common"
import { relations } from "drizzle-orm"
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { scrapersTable } from "./scrapers"
import { userDataStoresTable } from "./user-data-stores"

export const scraperDataSourcesTable = sqliteTable(
  "scraper_data_sources_table",
  {
    scraperId: integer("scraper_id")
      .notNull()
      .references(() => scrapersTable.id),
    dataStoreTableName: text("data_store_table_name")
      .notNull()
      .references(() => userDataStoresTable.tableName),
    sourceAlias: text("source_alias").notNull(),
    /** If whereSchema is provided, it will be used to create temporary view in the DataBridge (DataBridgeSourceType.TemporaryView) */
    whereSchema: text("where_schema", { mode: "json" }).$type<WhereSchema>(),
  },
  (table) => [
    primaryKey({ columns: [table.scraperId, table.dataStoreTableName] }),
    uniqueIndex("unique_source_alias").on(table.scraperId, table.sourceAlias),
  ],
)

export const scraperDataStoresRelations = relations(scraperDataSourcesTable, ({ one }) => ({
  scraper: one(scrapersTable, {
    fields: [scraperDataSourcesTable.scraperId],
    references: [scrapersTable.id],
  }),
  dataStore: one(userDataStoresTable, {
    fields: [scraperDataSourcesTable.dataStoreTableName],
    references: [userDataStoresTable.tableName],
  }),
}))

export const scrapersRelations = relations(scrapersTable, ({ many }) => ({
  dataStores: many(scraperDataSourcesTable),
}))

export const userDataStoresRelations = relations(userDataStoresTable, ({ many }) => ({
  scrapers: many(scraperDataSourcesTable),
}))
