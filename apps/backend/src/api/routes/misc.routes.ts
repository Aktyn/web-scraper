import {
  getApiResponseSchema,
  preferencesSchema,
  type SubscriptionMessage,
  SubscriptionMessageType,
  uuid,
} from "@web-scraper/common"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { preferencesTable } from "../../db/schema"
import { type ApiModuleContext } from "../api.module"

export async function miscRoutes(
  fastify: FastifyInstance,
  { events }: ApiModuleContext,
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
          200: getApiResponseSchema(preferencesSchema),
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
}
