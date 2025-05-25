import {
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  createUserDataStoreSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  preferencesSchema,
  type SqliteColumnType,
  updateOrDeleteUserDataStoreParamsSchema,
  updateUserDataStoreSchema,
  userDataStoreSchema,
} from "@web-scraper/common"
import { and, eq, ne, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { preferencesTable, userDataStoresTable } from "../../db/schema"
import { createUserDataStore } from "../../db/user-data-store-helpers"

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
          400: apiErrorResponseSchema,
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

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/user-data-stores",
    {
      schema: {
        body: createUserDataStoreSchema,
        response: {
          201: getApiResponseSchema(userDataStoreSchema),
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, description, columns } = request.body

      const existingStore = await fastify.db
        .select()
        .from(userDataStoresTable)
        .where(eq(userDataStoresTable.name, name))
        .get()

      if (existingStore) {
        return reply.status(409).send({
          error: "A data store with this name already exists",
        })
      }

      const { newStore, tableName } = await createUserDataStore(fastify.db, {
        name,
        description,
        columns,
      })

      const tableInfo = await fastify.db
        .run(sql`PRAGMA table_info(${sql.identifier(tableName)})`)
        .execute()

      const userDataStore = {
        ...newStore,
        recordsCount: 0,
        columns: tableInfo.rows.map((row) => ({
          name: row.name as string,
          type: row.type as SqliteColumnType,
          notNull: row.notnull === 1,
          defaultValue: row.dflt_value as string | null,
        })),
      }

      return reply.status(201).send({
        data: userDataStore,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/user-data-stores/:tableName",
    {
      schema: {
        params: updateOrDeleteUserDataStoreParamsSchema,
        body: updateUserDataStoreSchema,
        response: {
          200: getApiResponseSchema(userDataStoreSchema),
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params
      const { name, description } = request.body

      const existingStore = await fastify.db
        .select()
        .from(userDataStoresTable)
        .where(eq(userDataStoresTable.tableName, tableName))
        .get()

      if (!existingStore) {
        return reply.status(404).send({
          error: "Data store not found",
        })
      }

      if (name && name !== existingStore.name) {
        const nameConflict = await fastify.db
          .select()
          .from(userDataStoresTable)
          .where(
            and(eq(userDataStoresTable.name, name), ne(userDataStoresTable.tableName, tableName)),
          )
          .get()

        if (nameConflict) {
          return reply.status(409).send({
            error: "A data store with this name already exists",
          })
        }
      }

      const updateData: Partial<typeof existingStore> = {}
      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      //TODO: update columns (this require dynamic table to be deleted and recreated with new columns)

      const [updatedStore] = await fastify.db
        .update(userDataStoresTable)
        .set(updateData)
        .where(eq(userDataStoresTable.tableName, tableName))
        .returning()

      const countResult = await fastify.db
        .run(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`)
        .execute()
      const tableInfo = await fastify.db
        .run(sql`PRAGMA table_info(${sql.identifier(tableName)})`)
        .execute()

      const userDataStore = {
        ...updatedStore,
        recordsCount: Number(countResult.rows.at(0)?.count ?? 0),
        columns: tableInfo.rows.map((row) => ({
          name: row.name as string,
          type: row.type as SqliteColumnType,
          notNull: row.notnull === 1,
          defaultValue: row.dflt_value as string | null,
        })),
      }

      return reply.status(200).send({
        data: userDataStore,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/user-data-stores/:tableName",
    {
      schema: {
        params: updateOrDeleteUserDataStoreParamsSchema,
        response: {
          204: z.void(),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params

      const existingStore = await fastify.db
        .select()
        .from(userDataStoresTable)
        .where(eq(userDataStoresTable.tableName, tableName))
        .get()

      if (!existingStore) {
        return reply.status(404).send({
          error: "Data store not found",
        })
      }

      await fastify.db.run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`)

      await fastify.db
        .delete(userDataStoresTable)
        .where(eq(userDataStoresTable.tableName, tableName))

      return reply.status(204).send()
    },
  )
}
