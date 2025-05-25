import fastifyCors from "@fastify/cors"
import Fastify, { type FastifyServerOptions } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import type { DbModule } from "../db/db.module"
import * as routes from "./routes"

declare module "fastify" {
  interface FastifyInstance {
    db: DbModule
  }
}

export async function getApiModule(db: DbModule, fastifyOptions: FastifyServerOptions = {}) {
  const fastify = Fastify({
    logger: true,
    ...fastifyOptions,
  })

  const drizzlePlugin = fastifyPlugin((fastify) => {
    fastify.decorate("db", db)

    fastify.addHook("onClose", () => {
      db.$client.close()
    })
  })
  fastify.register(drizzlePlugin)

  fastify.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  for (const route of Object.values(routes)) {
    fastify.register(route)
  }

  return fastify
}
