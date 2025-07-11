import {
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  assert,
  executingScraperInfoSchema,
  executionIteratorSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  listScraperExecutionsQuerySchema,
  omit,
  paramsWithScraperIdSchema,
  scraperExecutionInfoSchema,
  scraperExecutionStatusSchema,
  scraperQuerySchema,
  scraperSchema,
  upsertScraperSchema,
  type UpsertScraper,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { asc, desc, eq, sql } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import fs from "node:fs"
import path from "node:path"
import z from "zod"
import {
  scraperDataSourcesTable,
  scraperExecutionIterationsTable,
  scraperExecutionsTable,
  scrapersTable,
} from "../../db/schema"
import { executeNewScraper } from "../../handlers/scraper.handler"
import type { ApiModuleContext } from "../api.module"
//@ts-expect-error No types for this package
import dialog from "node-file-dialog"
import { joinScraperWithDataSources } from "./helpers"

export async function scrapersRoutes(
  fastify: FastifyInstance,
  { logger, events, config }: ApiModuleContext,
) {
  function insertScraperWithDataSources(scraper: UpsertScraper) {
    return fastify.db.transaction(async (tx) => {
      const [newScraper] = await tx
        .insert(scrapersTable)
        .values(scraper)
        .returning()

      for (const dataSource of scraper.dataSources) {
        await tx
          .insert(scraperDataSourcesTable)
          .values({
            scraperId: newScraper.id,
            ...dataSource,
          })
          .onConflictDoUpdate({
            target: [
              scraperDataSourcesTable.scraperId,
              scraperDataSourcesTable.dataStoreTableName,
            ],
            set: {
              sourceAlias: dataSource.sourceAlias,
              whereSchema: dataSource.whereSchema,
            },
          })
      }

      return newScraper
    })
  }

  async function getExecutionIterations(executionId: number) {
    const results = await fastify.db
      .select()
      .from(scraperExecutionIterationsTable)
      .where(eq(scraperExecutionIterationsTable.executionId, executionId))
      .orderBy(asc(scraperExecutionIterationsTable.iteration))

    return results.map((result) => ({
      ...result,
      finishedAt: result.finishedAt.getTime(),
    }))
  }

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers",
    {
      schema: {
        querystring: scraperQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(scraperSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, name } = request.query

      const scrapers = await fastify.db
        .select({ scraper: scrapersTable })
        .from(scrapersTable)
        .leftJoin(
          scraperExecutionsTable,
          eq(scrapersTable.id, scraperExecutionsTable.scraperId),
        )
        .where(
          name
            ? sql`LOWER(${scrapersTable.name}) LIKE LOWER(${"%" + name + "%"})`
            : undefined,
        )
        .orderBy(
          desc(
            sql`COALESCE(MAX(${scraperExecutionsTable.createdAt}), ${scrapersTable.updatedAt})`,
          ),
        )
        .groupBy(scrapersTable.id)
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data = await Promise.all(
        scrapers
          .slice(0, pageSize)
          .map(({ scraper }) =>
            joinScraperWithDataSources(fastify.db, scraper),
          ),
      )

      return reply.status(200).send({
        data,
        page,
        pageSize,
        hasMore: scrapers.length > pageSize,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers/currently-executing",
    {
      schema: {
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(executingScraperInfoSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize } = request.query

      const instances = Scraper.getInstances()
      const data = instances
        .map((scraper) => ({
          id: scraper.id,
          name: scraper.name,
        }))
        .slice(page * pageSize, (page + 1) * pageSize)

      return reply.status(200).send({
        data,
        page,
        pageSize,
        hasMore: instances.length > (page + 1) * pageSize,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers/:id",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        response: {
          200: getApiResponseSchema(scraperSchema),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const scraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!scraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      return reply.status(200).send({
        data: await joinScraperWithDataSources(fastify.db, scraper),
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers",
    {
      schema: {
        body: upsertScraperSchema,
        response: {
          201: getApiResponseSchema(scraperSchema),
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        description,
        instructions,
        userDataDirectory,
        dataSources,
      } = request.body

      const existingScraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.name, name))
        .get()

      if (existingScraper) {
        return reply.status(409).send({
          error: "A scraper with this name already exists",
        })
      }

      const scraper = await insertScraperWithDataSources({
        name,
        description: description ?? null,
        instructions,
        userDataDirectory: userDataDirectory ?? null,
        dataSources,
      })

      return reply.status(201).send({
        data: await joinScraperWithDataSources(fastify.db, scraper),
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/scrapers/:id",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        body: upsertScraperSchema,
        response: {
          200: getApiResponseSchema(scraperSchema),
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const {
        name,
        description,
        instructions,
        userDataDirectory,
        dataSources,
      } = request.body

      const existingScraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!existingScraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      if (name !== existingScraper.name) {
        const nameConflict = await fastify.db
          .select()
          .from(scrapersTable)
          .where(eq(scrapersTable.name, name))
          .get()

        if (nameConflict) {
          return reply.status(409).send({
            error: "A scraper with this name already exists",
          })
        }
      }

      const scraper = await fastify.db.transaction(async (tx) => {
        const [updatedScraper] = await tx
          .update(scrapersTable)
          .set({
            name,
            description: description ?? null,
            instructions,
            userDataDirectory: userDataDirectory ?? null,
          })
          .where(eq(scrapersTable.id, id))
          .returning()

        await tx
          .delete(scraperDataSourcesTable)
          .where(eq(scraperDataSourcesTable.scraperId, id))

        for (const dataSource of dataSources) {
          await tx
            .insert(scraperDataSourcesTable)
            .values({
              scraperId: updatedScraper.id,
              ...dataSource,
            })
            .onConflictDoUpdate({
              target: [
                scraperDataSourcesTable.scraperId,
                scraperDataSourcesTable.dataStoreTableName,
              ],
              set: {
                sourceAlias: dataSource.sourceAlias,
                whereSchema: dataSource.whereSchema,
              },
            })
        }

        return updatedScraper
      })

      return reply.status(200).send({
        data: await joinScraperWithDataSources(fastify.db, scraper),
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/scrapers/:id",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        response: {
          204: z.void(),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const existingScraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!existingScraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      await fastify.db.delete(scrapersTable).where(eq(scrapersTable.id, id))

      return reply.status(204).send()
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers/:id/execute",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        body: z.object({
          iterator: executionIteratorSchema.nullable(),
        }),
        response: {
          200: getApiResponseSchema(z.null()),
          400: apiErrorResponseSchema,
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { iterator } = request.body

      const scraperResponse = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!scraperResponse) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      // NOTE: scrapersTable.id and scrapersTable.name are unique columns
      const scraperIdentifier =
        `${scraperResponse.id}-${scraperResponse.name}` as const

      if (Scraper.getInstance(scraperIdentifier)) {
        return reply.status(400).send({
          error: "Scraper is already running",
        })
      }

      const scraperData = await joinScraperWithDataSources(
        fastify.db,
        scraperResponse,
      )

      executeNewScraper(
        scraperResponse.id,
        scraperResponse.name,
        scraperData,
        iterator,
        {
          db: fastify.db,
          logger,
          events,
          config,
        },
      ).catch((error) => logger.error(error))

      return reply.status(200).send({
        data: null,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers/:id/execution-status",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        response: {
          200: getApiResponseSchema(scraperExecutionStatusSchema.nullable()),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const scraperResponse = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!scraperResponse) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      const scraperIdentifier =
        `${scraperResponse.id}-${scraperResponse.name}` as const
      const scraper = Scraper.getInstance(scraperIdentifier)

      return reply.status(200).send({
        data: scraper
          ? {
              state: scraper.state,
              executionInfo: scraper.executionInfo,
              currentlyExecutingInstruction:
                scraper.currentlyExecutingInstruction,
            }
          : null,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers/:id/terminate",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        response: {
          200: getApiResponseSchema(z.null()),
          400: apiErrorResponseSchema,
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const scraperResponse = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!scraperResponse) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      const scraperIdentifier =
        `${scraperResponse.id}-${scraperResponse.name}` as const
      const scraper = Scraper.getInstance(scraperIdentifier)

      if (!scraper) {
        return reply.status(400).send({
          error: "Scraper is not running",
        })
      }

      await scraper.destroy()

      assert(
        Scraper.getInstance(scraperIdentifier) === null,
        "Scraper not destroyed",
      )

      return reply.status(200).send({
        data: null,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers/executions",
    {
      schema: {
        querystring: listScraperExecutionsQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(scraperExecutionInfoSchema),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, id } = request.query

      if (id) {
        const scraper = await fastify.db
          .select({ id: scrapersTable.id })
          .from(scrapersTable)
          .where(eq(scrapersTable.id, id))
          .get()

        if (!scraper) {
          return reply.status(404).send({
            error: "Scraper not found",
          })
        }
      }

      const executionInfos = await fastify.db
        .select()
        .from(scraperExecutionsTable)
        .where(id ? eq(scraperExecutionsTable.scraperId, id) : undefined)
        .orderBy(desc(scraperExecutionsTable.createdAt))
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data = await Promise.all(
        executionInfos.slice(0, pageSize).map(async (info) => ({
          ...info,
          createdAt: info.createdAt.getTime(),
          iterations: await getExecutionIterations(info.id),
        })),
      )

      return reply.status(200).send({
        data,
        page,
        pageSize,
        hasMore: executionInfos.length > pageSize,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers/import",
    {
      schema: {
        response: {
          200: getApiResponseSchema(scraperSchema),
          400: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const [filePath] = await dialog({ type: "open-file" })
      const fileContent = fs.readFileSync(filePath, "utf8")

      const scraperData = scraperSchema.parse(JSON.parse(fileContent))

      const existingScraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.name, scraperData.name))
        .get()

      if (existingScraper) {
        return reply.status(409).send({
          error: "A scraper with this name already exists",
        })
      }

      const scraper = await insertScraperWithDataSources(
        omit(scraperData, "id", "createdAt", "updatedAt"),
      )

      const scraperWithDataSources = await joinScraperWithDataSources(
        fastify.db,
        scraper,
      )

      return reply.status(200).send({ data: scraperWithDataSources })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers/:id/export",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        response: {
          200: getApiResponseSchema(z.null()),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const scraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, id))
        .get()

      if (!scraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      const scraperData = await joinScraperWithDataSources(fastify.db, scraper)

      const [directory] = await dialog({ type: "directory" })

      if (!directory) {
        return reply.status(400).send({
          error: "No directory selected",
        })
      }

      const fileName = path.join(directory, `${scraper.name}.json`)

      fs.writeFileSync(fileName, JSON.stringify(scraperData, null, 2))

      return reply.status(200).send({ data: null })
    },
  )
}
