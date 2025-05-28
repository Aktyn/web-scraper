import {
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  createUserDataStoreSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  paramsWithTableNameSchema,
  preferencesSchema,
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
  const paramsWithTableNameAndIdSchema = z.object({
    tableName: z.string(),
    id: z.string(),
  })

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
          return {
            ...store,
            recordsCount: Number(countResult.rows.at(0)?.count ?? 0),
            columns: store.columnDefinitions,
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

      const { newStore } = await createUserDataStore(fastify.db, {
        name,
        description,
        columns,
      })

      const userDataStore = {
        ...newStore,
        recordsCount: 0,
        columns: newStore.columnDefinitions,
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
        params: paramsWithTableNameSchema,
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
      const { name, description, columns } = request.body

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

      const columnsInfo = existingStore.columnDefinitions

      if (JSON.stringify(columns) !== JSON.stringify(columnsInfo)) {
        //Recreate the table with new columns
        await fastify.db.run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`).execute()

        await fastify.db
          .delete(userDataStoresTable)
          .where(eq(userDataStoresTable.tableName, tableName))

        const { newStore } = await createUserDataStore(fastify.db, {
          name,
          description,
          columns,
        })

        return reply.status(200).send({
          data: {
            ...newStore,
            recordsCount: 0,
            columns: newStore.columnDefinitions,
          },
        })
      } else {
        const [updatedStore] = await fastify.db
          .update(userDataStoresTable)
          .set({
            name: name,
            description: description ?? null,
          })
          .where(eq(userDataStoresTable.tableName, tableName))
          .returning()

        const countResult = await fastify.db
          .run(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`)
          .execute()

        const userDataStore = {
          ...updatedStore,
          recordsCount: Number(countResult.rows.at(0)?.count ?? 0),
          columns: columnsInfo,
        }

        return reply.status(200).send({
          data: userDataStore,
        })
      }
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/user-data-stores/:tableName",
    {
      schema: {
        params: paramsWithTableNameSchema,
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

      await fastify.db.run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`).execute()

      await fastify.db
        .delete(userDataStoresTable)
        .where(eq(userDataStoresTable.tableName, tableName))

      return reply.status(204).send()
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/user-data-stores/:tableName/records",
    {
      schema: {
        params: paramsWithTableNameSchema,
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(z.record(z.string(), z.unknown())),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params
      const { page, pageSize } = request.query

      const storeDataResponse = await fastify.db
        .run(
          sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT ${pageSize} OFFSET ${page * pageSize}`,
        )
        .execute()

      return reply.status(200).send({
        data: storeDataResponse.rows.slice(0, pageSize),
        page,
        pageSize,
        hasMore: storeDataResponse.rows.length > pageSize,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/user-data-stores/:tableName/records",
    {
      schema: {
        params: paramsWithTableNameSchema,
        body: z.record(z.string(), z.unknown()),
        response: {
          201: getApiResponseSchema(z.record(z.string(), z.unknown())),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params
      const recordData = request.body

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

      const columns = Object.keys(recordData).filter((key) => key !== "id")
      const values = columns.map((col) => recordData[col])

      const columnNames = columns.map((col) => sql.identifier(col))
      const valuePlaceholders = values.map((value) => sql`${value}`)

      const insertResult = await fastify.db
        .run(
          sql`INSERT INTO ${sql.identifier(tableName)} (${sql.join(columnNames, sql`, `)}) VALUES (${sql.join(valuePlaceholders, sql`, `)})`,
        )
        .execute()

      const selectResult = await fastify.db
        .run(
          sql`SELECT * FROM ${sql.identifier(tableName)} WHERE id = ${insertResult.lastInsertRowid}`,
        )
        .execute()

      return reply.status(201).send({
        data: selectResult.rows[0],
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/user-data-stores/:tableName/records/:id",
    {
      schema: {
        params: paramsWithTableNameAndIdSchema,
        body: z.record(z.string(), z.unknown()),
        response: {
          200: getApiResponseSchema(z.record(z.string(), z.unknown())),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName, id } = request.params
      const recordData = request.body

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

      const existingRecord = await fastify.db
        .run(sql`SELECT * FROM ${sql.identifier(tableName)} WHERE id = ${id}`)
        .execute()

      if (existingRecord.rows.length === 0) {
        return reply.status(404).send({
          error: "Record not found",
        })
      }

      const columns = Object.keys(recordData).filter((key) => key !== "id")
      const setClause = columns.map((col) => sql`${sql.identifier(col)} = ${recordData[col]}`)

      await fastify.db
        .run(
          sql`UPDATE ${sql.identifier(tableName)} SET ${sql.join(setClause, sql`, `)} WHERE id = ${id}`,
        )
        .execute()

      const selectResult = await fastify.db
        .run(sql`SELECT * FROM ${sql.identifier(tableName)} WHERE id = ${id}`)
        .execute()

      return reply.status(200).send({
        data: selectResult.rows[0],
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/user-data-stores/:tableName/records/:id",
    {
      schema: {
        params: paramsWithTableNameAndIdSchema,
        response: {
          204: z.void(),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName, id } = request.params

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

      const existingRecord = await fastify.db
        .run(sql`SELECT * FROM ${sql.identifier(tableName)} WHERE id = ${id}`)
        .execute()

      if (existingRecord.rows.length === 0) {
        return reply.status(404).send({
          error: "Record not found",
        })
      }

      await fastify.db.run(sql`DELETE FROM ${sql.identifier(tableName)} WHERE id = ${id}`).execute()

      return reply.status(204).send()
    },
  )
}
