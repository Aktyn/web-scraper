import fastifyCors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import type { SimpleLogger } from "@web-scraper/common"
import Fastify, { type FastifyServerOptions } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { FastifySSEPlugin } from "fastify-sse-v2"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import fastifyZodQueryCoercion from "fastify-zod-query-coercion"
import fs from "fs"
import path from "path"
import type { Logger } from "pino"
import type { Config } from "../config/config"
import { cwd } from "../cwd"
import type { DbModule } from "../db/db.module"
import type { EventsModule } from "../events/events.module"
import * as routes from "./routes"

declare module "fastify" {
  interface FastifyInstance {
    db: DbModule
  }
}

export type ApiModuleContext = {
  db: DbModule
  config: Config
  logger: Logger | SimpleLogger
  events: EventsModule
}

export async function getApiModule(
  context: ApiModuleContext,
  fastifyOptions: FastifyServerOptions = {},
) {
  const fastify = Fastify({
    loggerInstance: "silent" in context.logger ? context.logger : undefined,
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  await fastify.register(fastifyZodQueryCoercion)

  fastify.register(FastifySSEPlugin)

  for (const route of Object.values(routes)) {
    fastify.register(route, context)
  }

  const webPath = path.join(cwd(), "web")

  if (fs.existsSync(webPath)) {
    fastify.register(fastifyStatic, {
      root: webPath,
    })
  }

  return fastify
}

export type ApiModule = Awaited<ReturnType<typeof getApiModule>>
