import type { FastifyInstance } from "fastify"
import { preferencesTable } from "../../db/schema"

export async function miscRoutes(fastify: FastifyInstance) {
  fastify.get("/preferences", async (_request, reply) => {
    const preferences = await fastify.db.select().from(preferencesTable)
    return reply.status(200).send(preferences)
  })
}
