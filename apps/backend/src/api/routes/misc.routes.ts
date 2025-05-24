import { preferencesSchema, userDataStoresSchema } from "@web-scraper/common"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
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
          200: userDataStoresSchema,
        },
      },
    },
    async (_request, reply) => {
      const userDataStores = await fastify.db.select().from(userDataStoresTable)
      return reply.status(200).send(userDataStores)
    },
  )
}
