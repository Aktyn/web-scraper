import { preferencesSchema, type SqliteColumnType, userDataStoreSchema } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { preferencesTable, userDataStoresTable } from "../../db/schema"

export async function miscRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/preferences",
    {
      schema: {
        response: {
          200: preferencesSchema,
        },
      },
    },
    async (_request, reply) => {
      const preferences = await fastify.db.select().from(preferencesTable)
      return reply.status(200).send(preferences)
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/user-data-stores",
    {
      schema: {
        response: {
          200: z.array(userDataStoreSchema),
        },
      },
    },
    async (_request, reply) => {
      const stores = await fastify.db.select().from(userDataStoresTable)

      const userDataStores = await Promise.all(
        stores.map(async (store) => {
          const count = await fastify.db
            .run(sql`SELECT COUNT(*) as count FROM ${sql.identifier(store.tableName)}`)
            .execute()
          const tableInfo = await fastify.db
            .run(sql`PRAGMA table_info(${sql.identifier(store.tableName)})`)
            .execute()
          return {
            ...store,
            recordsCount: Number(count.rows.at(0)?.count ?? 0),
            columns: tableInfo.rows.map((row) => ({
              name: row.name as string,
              type: row.type as SqliteColumnType,
              notNull: row.notnull === 1,
              defaultValue: row.dflt_value as string | null,
            })),
          }
        }),
      )

      return reply.status(200).send(userDataStores)
    },
  )
}
