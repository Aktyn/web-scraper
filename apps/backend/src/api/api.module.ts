import Fastify from "fastify"
import type { DbModule } from "../db/db.module"
import * as routes from "./routes"
import fastifyPlugin from "fastify-plugin"

declare module "fastify" {
  interface FastifyInstance {
    db: DbModule
  }
}

export async function getApiModule(db: DbModule) {
  const fastify = Fastify({
    logger: true,
  })

  const drizzlePlugin = fastifyPlugin((fastify) => {
    fastify.decorate("db", db)

    fastify.addHook("onClose", () => {
      db.$client.close()
    })
  })
  fastify.register(drizzlePlugin)

  for (const route of Object.values(routes)) {
    fastify.register(route)
  }

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    console.info(`Server is now listening on ${address}`)
  })
}
