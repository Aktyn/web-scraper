import fastifyCors from "@fastify/cors"
import Fastify, { type FastifyServerOptions } from "fastify"
import fastifyPlugin from "fastify-plugin"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import type { DbModule } from "../db/db.module"
import * as routes from "./routes"
import { FastifySSEPlugin } from "fastify-sse-v2"
import type { SimpleLogger } from "@web-scraper/common"
import type { Config } from "../config/config"
import type { EventsModule } from "../events/events.module"

declare module "fastify" {
  interface FastifyInstance {
    db: DbModule
  }
}

export type ApiModuleContext = {
  db: DbModule
  config: Config
  logger: SimpleLogger
  events: EventsModule
}

export async function getApiModule(
  context: ApiModuleContext,
  fastifyOptions: FastifyServerOptions = {},
) {
  const fastify = Fastify({
    logger: true,
    bodyLimit: 1024 * 1024 * 128, // 128MB
    ...fastifyOptions,
  })

  const drizzlePlugin = fastifyPlugin((fastify) => {
    fastify.decorate("db", context.db)

    fastify.addHook("onClose", () => {
      context.db.$client.close()
    })
  })
  fastify.register(drizzlePlugin)

  fastify.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  fastify.register(FastifySSEPlugin)

  for (const route of Object.values(routes)) {
    fastify.register(route, context)
  }

  return fastify
}
