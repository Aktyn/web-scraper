import {
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  createScraperSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  paramsWithScraperIdSchema,
  scraperSchema,
  updateScraperSchema,
  type ScraperType,
} from "@web-scraper/common"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { scraperDataSourcesTable, scrapersTable } from "../../db/schema"

export async function scrapersRoutes(fastify: FastifyInstance) {
  async function joinScraperWithDataSources(
    scraper: Omit<ScraperType, "dataSources">,
  ) {
    const dataSources = await fastify.db
      .select()
      .from(scraperDataSourcesTable)
      .where(eq(scraperDataSourcesTable.scraperId, scraper.id))

    return {
      ...scraper,
      dataSources,
    }
  }

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/scrapers",
    {
      schema: {
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(scraperSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize } = request.query

      const scrapers = await fastify.db
        .select()
        .from(scrapersTable)
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data = await Promise.all(
        scrapers.slice(0, pageSize).map(joinScraperWithDataSources),
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
        data: await joinScraperWithDataSources(scraper),
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/scrapers",
    {
      schema: {
        body: createScraperSchema,
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

      const scraper = await fastify.db.transaction(async (tx) => {
        const [newScraper] = await tx
          .insert(scrapersTable)
          .values({
            name,
            description: description ?? null,
            instructions,
            userDataDirectory: userDataDirectory ?? null,
          })
          .returning()

        for (const dataSource of dataSources) {
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

      return reply.status(201).send({
        data: await joinScraperWithDataSources(scraper),
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/scrapers/:id",
    {
      schema: {
        params: paramsWithScraperIdSchema,
        body: updateScraperSchema,
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
        data: await joinScraperWithDataSources(scraper),
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

      //TODO: test with custom userDataDirectory
      console.info("Executing scraper:", scraper)

      //TODO: use to broadcast scraper execution events for real-time feedback
      // events.emit("broadcast", {
      //   type: SubscriptionMessageType.SubscriptionInitialized,
      //   sessionId,
      // })

      return reply.status(200).send({
        data: null,
      })
    },
  )
}
