import {
  apiErrorPayload,
  apiPaginationQuerySchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  preferencesSchema,
  type SqliteColumnType,
  userDataStoreSchema,
} from "@web-scraper/common"
import { sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { preferencesTable, userDataStoresTable } from "../../db/schema"

export async function miscRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/preferences",
    {
      schema: {
        response: {
          200: getApiResponseSchema(preferencesSchema),
        },
      },
    },
    async (_request, reply) => {
      const preferences = await fastify.db.select().from(preferencesTable)
      return reply.status(200).send({
        data: preferences,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/user-data-stores",
    {
      schema: {
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(userDataStoreSchema),
          400: apiErrorPayload,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize } = request.query

      const stores = await fastify.db
        .select()
        .from(userDataStoresTable)
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const userDataStores = await Promise.all(
        stores.map(async (store) => {
          const countResult = await fastify.db
            .run(sql`SELECT COUNT(*) as count FROM ${sql.identifier(store.tableName)}`)
            .execute()
          const tableInfo = await fastify.db
            .run(sql`PRAGMA table_info(${sql.identifier(store.tableName)})`)
            .execute()
          return {
            ...store,
            recordsCount: Number(countResult.rows.at(0)?.count ?? 0),
            columns: tableInfo.rows.map((row) => ({
              name: row.name as string,
              type: row.type as SqliteColumnType,
              notNull: row.notnull === 1,
              defaultValue: row.dflt_value as string | null,
            })),
          }
        }),
      )

      return reply.status(200).send({
        data: userDataStores.slice(0, pageSize),
        page,
        pageSize,
        hasMore: userDataStores.length > pageSize,
      })
    },
  )
}
