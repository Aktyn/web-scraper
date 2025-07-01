import { relations } from "drizzle-orm"
import { scraperDataSourcesTable } from "./scraper-data-sources.schema"
import {
  scraperExecutionIterationsTable,
  scraperExecutionsTable,
} from "./scraper-executions.schema"
import { scrapersTable } from "./scrapers.schema"
import { userDataStoresTable } from "./user-data-stores.schema"
import { notificationsTable } from "./notifications.schema"

export * from "./misc.schema"
export * from "./scraper-data-sources.schema"
export * from "./scraper-executions.schema"
export * from "./scrapers.schema"
export * from "./user-data-stores.schema"
export * from "./notifications.schema"
export * from "./routines.schema"

export const scrapersRelations = relations(scrapersTable, ({ many }) => ({
  dataSources: many(scraperDataSourcesTable),
  executions: many(scraperExecutionsTable),
  notifications: many(notificationsTable),
}))

export const scraperDataSourcesRelations = relations(
  scraperDataSourcesTable,
  ({ one }) => ({
    scraper: one(scrapersTable, {
      fields: [scraperDataSourcesTable.scraperId],
      references: [scrapersTable.id],
    }),
    dataStore: one(userDataStoresTable, {
      fields: [scraperDataSourcesTable.dataStoreTableName],
      references: [userDataStoresTable.tableName],
    }),
  }),
)

export const userDataStoresRelations = relations(
  userDataStoresTable,
  ({ many }) => ({
    scrapers: many(scraperDataSourcesTable),
  }),
)

export const scraperExecutionsRelations = relations(
  scraperExecutionsTable,
  ({ one, many }) => ({
    scraper: one(scrapersTable, {
      fields: [scraperExecutionsTable.scraperId],
      references: [scrapersTable.id],
    }),
    iterations: many(scraperExecutionIterationsTable),
  }),
)

export const scraperExecutionIterationsRelations = relations(
  scraperExecutionIterationsTable,
  ({ one }) => ({
    execution: one(scraperExecutionsTable, {
      fields: [scraperExecutionIterationsTable.executionId],
      references: [scraperExecutionsTable.id],
    }),
  }),
)
