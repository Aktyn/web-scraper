import {
  apiErrorResponseSchema,
  getApiResponseSchema,
  runUnsafeAsync,
  statusSchema,
  type SubscriptionMessage,
  SubscriptionMessageType,
  userPreferencesSchema,
  uuid,
} from "@web-scraper/common"
import { checkModelAvailability } from "@web-scraper/core"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { preferencesTable } from "../../db/schema"
import { type ApiModuleContext } from "../api.module"

export async function miscRoutes(
  fastify: FastifyInstance,
  { events, config }: ApiModuleContext,
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

  fastify.get("/subscribe", function (req, res) {
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
    "/preferences",
    {
      schema: {
        response: {
          200: getApiResponseSchema(userPreferencesSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const preferences = await fastify.db.select().from(preferencesTable)
      return reply.status(200).send({
        data: preferences,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/preferences/reset",
    {
      schema: {
        response: {
          200: getApiResponseSchema(userPreferencesSchema),
        },
      },
    },
    async (_request, reply) => {
      await fastify.db.delete(preferencesTable)

      config.resetPreferences()

      return reply.status(200).send({
        data: [],
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/preferences/:key",
    {
      schema: {
        params: userPreferencesSchema.element.pick({
          key: true,
        }),
        body: userPreferencesSchema.element.pick({
          value: true,
        }),
        response: {
          200: getApiResponseSchema(userPreferencesSchema.element),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { key } = request.params
      const { value } = request.body

      if (!(key in config.preferences)) {
        return reply.code(404).send({
          error: "Not Found",
          code: "NOT_FOUND",
          message: `Preference with key ${key} not found`,
        })
      }

      const [upsertedPreference] = await fastify.db
        .insert(preferencesTable)
        .values({ key, value })
        .onConflictDoUpdate({
          target: preferencesTable.key,
          set: {
            value,
          },
        })
        .returning()

      config.updatePreferences(key, value as never)

      return reply.status(200).send({
        data: upsertedPreference,
      })
    },
  )

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
}
