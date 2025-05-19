import type { FastifyInstance } from "fastify"
import { usersTable } from "../../db/schema"

export async function dataRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (_request, reply) => {
    const users = await fastify.db.select().from(usersTable)
    return reply.status(200).send({ data: users })
  })
}
