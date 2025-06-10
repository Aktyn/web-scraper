import {
  type SubscriptionMessage,
  SubscriptionMessageType,
  apiErrorResponseSchema,
  getApiResponseSchema,
  userPreferencesSchema,
  uuid,
} from "@web-scraper/common"
import { eq } from "drizzle-orm"
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
      const [updatedPreference] = await fastify.db
        .update(preferencesTable)
        .set({ value })
        .where(eq(preferencesTable.key, key))
        .returning()

      if (!updatedPreference) {
        return reply.code(404).send({
          error: "Not Found",
          code: "NOT_FOUND",
          message: `Preference with key ${key} not found`,
        })
      }

      config.updatePreferences(key, value as never)

      return reply.status(200).send({
        data: updatedPreference,
      })
    },
  )
}
