import {
  type UserDataStoreColumn,
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  createUserDataStoreSchema,
  exportUserDataStoreSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  importUserDataStoreSchema,
  paramsWithTableNameSchema,
  updateUserDataStoreSchema,
  userDataStoreSchema,
} from "@web-scraper/common"
import { and, eq, ne, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { userDataStoresTable, scraperDataSourcesTable } from "../../db/schema"
import { createUserDataStore } from "../../db/user-data-store-helpers"
//@ts-expect-error No types for this package
import dialog from "node-file-dialog"
import path from "path"
import fs from "fs"
import type { ApiModuleContext } from "../api.module"

export async function userDataStoresRoutes(
  fastify: FastifyInstance,
  { logger }: ApiModuleContext,
) {
  const paramsWithTableNameAndIdSchema = z.object({
    tableName: z.string(),
    id: z.string(),
  })

  const insertDataStoreRecords = async (
    tableName: string,
    rows: Array<Record<string, unknown>>,
    updateRows: boolean,
  ) => {
    logger.info(`Inserting ${rows.length} records into ${tableName}`)

    await fastify.db.transaction(async (tx) => {
      for (const row of rows) {
        if (!row || Object.keys(row).length === 0) {
          continue
        }
        const columns = Object.keys(row)

        const queryChunks = [
          sql`INSERT INTO ${sql.identifier(tableName)} (${sql.join(
            columns.map((c) => sql.identifier(c)),
            sql`, `,
          )}) VALUES (${sql.join(
            Object.values(row).map((v) => sql.param(v)),
            sql`, `,
          )})`,
        ]

        if (updateRows) {
          const columnsToUpdate = columns.filter((c) => c !== "id")
          if (columnsToUpdate.length > 0) {
            const setClause = sql.join(
              columnsToUpdate.map(
                (col) =>
                  sql`${sql.identifier(col)} = excluded.${sql.identifier(col)}`,
              ),
              sql`, `,
            )
            queryChunks.push(sql` ON CONFLICT(id) DO UPDATE SET ${setClause}`)
          }
        } else {
          queryChunks.push(sql` ON CONFLICT(id) DO NOTHING`)
        }

        const query = sql.join(queryChunks, sql.raw(" "))
        await tx.run(query).execute()
      }
    })
  }

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
            .run(
              sql`SELECT COUNT(*) as count FROM ${sql.identifier(store.tableName)}`,
            )
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

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/user-data-stores/:tableName",
    {
      schema: {
        params: paramsWithTableNameSchema,
        response: {
          200: getApiResponseSchema(userDataStoreSchema),
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

      const countResult = await fastify.db
        .run(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`)
        .execute()

      const userDataStore = {
        ...existingStore,
        recordsCount: Number(countResult.rows.at(0)?.count ?? 0),
        columns: existingStore.columnDefinitions,
      }

      return reply.status(200).send({
        data: userDataStore,
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
            and(
              eq(userDataStoresTable.name, name),
              ne(userDataStoresTable.tableName, tableName),
            ),
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
        await fastify.db
          .run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`)
          .execute()

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

      await fastify.db
        .delete(scraperDataSourcesTable)
        .where(eq(scraperDataSourcesTable.dataStoreTableName, tableName))

      await fastify.db
        .run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`)
        .execute()

      await fastify.db
        .delete(userDataStoresTable)
        .where(eq(userDataStoresTable.tableName, tableName))

      return reply.status(204).send()
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/user-data-stores/:tableName/import",
    {
      schema: {
        params: paramsWithTableNameSchema,
        body: importUserDataStoreSchema,
        response: {
          200: getApiResponseSchema(z.null()),
          400: apiErrorResponseSchema,
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params
      const { updateRows } = request.body

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

      const [filePath] = await dialog({ type: "open-file" })
      const fileContent = fs.readFileSync(filePath, "utf8")

      const format = String(filePath).split(".").pop() ?? ""

      if (format !== "csv" && format !== "json") {
        return reply.status(400).send({
          error: "Invalid file format",
        })
      }

      if (format === "csv") {
        const csvRows = fileContent.split("\n")
        const header = csvRows.shift()
        const columnNames = header?.split(/(?<!\\),/).map(unescapeCommas) ?? []

        if (columnNames.length !== existingStore.columnDefinitions.length) {
          return reply.status(400).send({
            error: "Number of columns does not match",
          })
        }

        for (const columnName of columnNames) {
          const existingColumn = existingStore.columnDefinitions.find(
            (c) => c.name === columnName,
          )

          if (!existingColumn) {
            return reply.status(400).send({
              error: `Column "${columnName}" does not exist`,
            })
          }
        }

        await insertDataStoreRecords(
          tableName,
          csvRows.map((row) => {
            const values = row.split(/(?<!\\),/).map(unescapeCommas)

            return columnNames.reduce(
              (acc, columnName, index) => {
                acc[columnName] = values[index]
                return acc
              },
              {} as Record<string, unknown>,
            )
          }),
          updateRows,
        )
      } else {
        const parsedData = JSON.parse(fileContent) as {
          columnDefinitions?: Array<UserDataStoreColumn>
          rows: Array<Record<string, unknown>>
        }

        if (parsedData.columnDefinitions) {
          // Make sure the column definitions are the same as the existing store
          const res = await fastify.db
            .select({
              columnDefinitions: userDataStoresTable.columnDefinitions,
            })
            .from(userDataStoresTable)
            .where(eq(userDataStoresTable.tableName, tableName))
            .get()

          if (
            res?.columnDefinitions.length !==
            parsedData.columnDefinitions.length
          ) {
            return reply.status(400).send({
              error: "Number of columns does not match",
            })
          }

          for (const column of parsedData.columnDefinitions) {
            const existingColumn = res.columnDefinitions.find(
              (c) => c.name === column.name,
            )

            if (existingColumn?.type !== column.type) {
              return reply.status(400).send({
                error: `Column "${column.name}" type does not match`,
              })
            }

            if (existingColumn?.notNull !== column.notNull) {
              return reply.status(400).send({
                error: `Column "${column.name}" notNull does not match`,
              })
            }
          }
        }

        await insertDataStoreRecords(tableName, parsedData.rows, updateRows)
      }

      return reply.status(200).send({ data: null })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/user-data-stores/:tableName/export",
    {
      schema: {
        params: paramsWithTableNameSchema,
        body: exportUserDataStoreSchema,
        response: {
          200: getApiResponseSchema(z.null()),
          400: apiErrorResponseSchema,
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tableName } = request.params
      const { format, includeColumnDefinitions } = request.body

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

      const { rows, columns } = await fastify.db
        .run(sql`SELECT * FROM ${sql.identifier(tableName)}`)
        .execute()

      const response =
        format === "json" && includeColumnDefinitions
          ? await fastify.db
              .select({
                columnDefinitions: userDataStoresTable.columnDefinitions,
              })
              .from(userDataStoresTable)
              .where(eq(userDataStoresTable.tableName, tableName))
              .get()
          : null

      const columnDefinitions = response?.columnDefinitions ?? null

      const stringifiedData =
        format === "csv"
          ? columns.map(escapeCommas).join(",") +
            "\n" +
            rows
              .map((row) =>
                columns
                  .map((column) =>
                    row[column] === null
                      ? ""
                      : escapeCommas(String(row[column])),
                  )
                  .join(","),
              )
              .join("\n")
          : JSON.stringify(
              columnDefinitions
                ? {
                    columnDefinitions,
                    rows,
                  }
                : {
                    rows,
                  },
              null,
              2,
            )

      const [directory] = await dialog({ type: "directory" })

      if (!directory) {
        return reply.status(400).send({
          error: "No directory selected",
        })
      }

      const fileName = path.join(directory, `${tableName}.${format}`)

      fs.writeFileSync(fileName, stringifiedData)

      return reply.status(200).send({ data: null })
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
          sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT ${pageSize + 1} OFFSET ${page * pageSize}`,
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

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/user-data-stores/:tableName/records",
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

      await fastify.db
        .run(sql`DELETE FROM ${sql.identifier(tableName)}`)
        .execute()

      await fastify.db
        .run(sql`DELETE FROM sqlite_sequence WHERE name = ${tableName}`)
        .execute()

      return reply.status(204).send()
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
      const setClause = columns.map(
        (col) => sql`${sql.identifier(col)} = ${recordData[col]}`,
      )

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

      await fastify.db
        .run(sql`DELETE FROM ${sql.identifier(tableName)} WHERE id = ${id}`)
        .execute()

      return reply.status(204).send()
    },
  )
}

function escapeCommas(value: string) {
  return String(value).replaceAll(",", "\\,")
}

function unescapeCommas(value: string) {
  return String(value).replaceAll("\\,", ",")
}
