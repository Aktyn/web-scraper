import {
  type Notification,
  apiErrorResponseSchema,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  notificationQuerySchema,
  notificationSchema,
  SubscriptionMessageType,
} from "@web-scraper/common"
import { desc, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { notificationsTable } from "../../db/schema"
import { type ApiModuleContext } from "../api.module"

const notificationParamsSchema = z.object({
  id: z.coerce.number(),
})

export async function notificationsRoutes(
  fastify: FastifyInstance,
  { events }: ApiModuleContext,
) {
  events.on("notification", async (notificationData) => {
    const notificationRow = await fastify.db
      .insert(notificationsTable)
      .values({
        data: notificationData,
      })
      .returning()
      .get()

    const notification = notificationRowToNotification(notificationRow)

    events.emit("broadcast", {
      type: SubscriptionMessageType.Notification,
      notification,
    })
  })

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/notifications",
    {
      schema: {
        querystring: notificationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(notificationSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, read } = request.query

      const response = await fastify.db
        .select()
        .from(notificationsTable)
        .where(
          typeof read === "boolean"
            ? eq(notificationsTable.read, read)
            : undefined,
        )
        .orderBy(desc(notificationsTable.createdAt))
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const hasMore = response.length > pageSize
      const notificationsToReturn = response.slice(0, pageSize)

      const notifications = notificationsToReturn.map(
        notificationRowToNotification,
      )

      return reply.status(200).send({
        data: notifications,
        page,
        pageSize,
        hasMore,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().patch(
    "/notifications/:id/read",
    {
      schema: {
        params: notificationParamsSchema,
        response: {
          200: notificationSchema,
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const updatedNotification = await fastify.db
        .update(notificationsTable)
        .set({ read: true })
        .where(eq(notificationsTable.id, id))
        .returning()
        .get()

      if (!updatedNotification) {
        return reply.status(404).send({ error: "Notification not found" })
      }

      return reply
        .status(200)
        .send(notificationRowToNotification(updatedNotification))
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().patch(
    "/notifications/read-all",
    {
      schema: {
        response: {
          200: getApiResponseSchema(z.null()),
        },
      },
    },
    async (_request, reply) => {
      await fastify.db
        .update(notificationsTable)
        .set({ read: true })
        .where(eq(notificationsTable.read, false))

      return reply.status(200).send({ data: null })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/notifications/:id",
    {
      schema: {
        params: notificationParamsSchema,
        response: {
          204: z.void(),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const deletedNotification = await fastify.db
        .delete(notificationsTable)
        .where(eq(notificationsTable.id, id))
        .returning()
        .get()

      if (!deletedNotification) {
        return reply.status(404).send({ error: "Notification not found" })
      }

      return reply.status(204).send()
    },
  )
}

function notificationRowToNotification(
  row: typeof notificationsTable.$inferSelect,
): Notification {
  return {
    id: row.id,
    createdAt: row.createdAt.getTime(),
    read: row.read,
    ...row.data,
  }
}
