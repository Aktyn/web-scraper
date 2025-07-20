import {
  getApiResponseSchema,
  runUnsafeAsync,
  statusSchema,
  type SubscriptionMessage,
  SubscriptionMessageType,
  uuid,
} from "@web-scraper/common"
import { checkModelAvailability } from "@web-scraper/core"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import type { ApiModuleContext } from "../api.module"
import { z } from "zod"

export async function miscRoutes(
  fastify: FastifyInstance,
  { dbModule, events, config }: ApiModuleContext,
) {
  const subscriptions = new Map<
    string,
    (message: SubscriptionMessage) => void
  >()

  events.on("broadcast", (message) => {
    for (const callback of subscriptions.values()) {
      callback(message)
    }
  })

  fastify.get("/subscribe", (req, res) => {
    const sessionId = uuid()

    subscriptions.set(sessionId, (message) => {
      res.sse({
        id: uuid(),
        event: "subscription-message",
        data: JSON.stringify(message),
      })
    })

    res.sse({
      id: uuid(),
      event: "subscription-message",
      data: JSON.stringify({
        type: SubscriptionMessageType.SubscriptionInitialized,
        sessionId,
      }),
    })

    req.socket.on("close", () => {
      subscriptions.delete(sessionId)
    })
  })

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/status",
    {
      schema: {
        response: {
          200: getApiResponseSchema(statusSchema),
        },
      },
    },
    async (_request, reply) => {
      const localizationModelAvailability = await runUnsafeAsync(
        async () =>
          await checkModelAvailability(config.preferences.localizationModel),
        () => void 0,
      )
      const navigationModelAvailability = await runUnsafeAsync(
        async () =>
          await checkModelAvailability(config.preferences.navigationModel),
        () => void 0,
      )

      return reply.status(200).send({
        data: {
          ollamaInstalled: localizationModelAvailability !== null,
          localizationModelAvailable: Boolean(localizationModelAvailability),
          navigationModelAvailable: Boolean(navigationModelAvailability),
        },
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/reset-database",
    {
      schema: {
        response: {
          200: getApiResponseSchema(z.null()),
        },
      },
    },
    async (_request, reply) => {
      await dbModule.resetDatabase()
      config.resetPreferences()

      return reply.status(200).send({
        data: null,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/seed-database",
    {
      schema: {
        response: {
          200: getApiResponseSchema(z.null()),
        },
      },
    },
    async (_request, reply) => {
      await dbModule.seedDatabase()

      return reply.status(200).send({
        data: null,
      })
    },
  )
}
