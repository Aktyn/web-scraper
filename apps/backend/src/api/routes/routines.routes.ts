import {
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  calculateNextScheduledExecutionAt,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  routineSchema,
  RoutineStatus,
  upsertRoutineSchema,
  type Routine,
} from "@web-scraper/common"
import { desc, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { routinesTable, scrapersTable } from "../../db/schema"
import type { ApiModuleContext } from "../api.module"

const paramsWithRoutineIdSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export async function routinesRoutes(
  fastify: FastifyInstance,
  _context: ApiModuleContext,
) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/routines",
    {
      schema: {
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(routineSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize } = request.query

      const routines = await fastify.db
        .select({
          routine: routinesTable,
          scraper: scrapersTable,
        })
        .from(routinesTable)
        .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
        .orderBy(desc(routinesTable.updatedAt))
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data: Routine[] = routines
        .slice(0, pageSize)
        .map(({ routine, scraper }) => ({
          ...routine,
          scraperName: scraper.name,
          previousExecutionsCount: 0,
          nextScheduledExecutionAt:
            routine.nextScheduledExecutionAt.getTime() || null,
          createdAt: routine.createdAt.getTime(),
          updatedAt: routine.updatedAt.getTime(),
        }))

      return reply.status(200).send({
        data,
        page,
        pageSize,
        hasMore: routines.length > pageSize,
      })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/routines/:id",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const routineResult = await fastify.db
        .select({
          routine: routinesTable,
          scraper: scrapersTable,
        })
        .from(routinesTable)
        .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
        .where(eq(routinesTable.id, id))
        .get()

      if (!routineResult) {
        return reply.status(404).send({
          error: "Routine not found",
        })
      }

      const { routine, scraper } = routineResult

      const data: Routine = {
        ...routine,
        scraperName: scraper.name,
        previousExecutionsCount: 0,
        nextScheduledExecutionAt:
          routine.nextScheduledExecutionAt.getTime() || null,
        createdAt: routine.createdAt.getTime(),
        updatedAt: routine.updatedAt.getTime(),
      }

      return reply.status(200).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/routines",
    {
      schema: {
        body: upsertRoutineSchema,
        response: {
          201: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { scraperId } = request.body

      const scraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, scraperId))
        .get()

      if (!scraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      const [newRoutine] = await fastify.db
        .insert(routinesTable)
        .values({
          ...request.body,
          nextScheduledExecutionAt:
            calculateNextScheduledExecutionAt({
              status: RoutineStatus.Active,
              scheduler: request.body.scheduler,
            }) ?? zeroDate,
        })
        .returning()

      const data: Routine = {
        ...newRoutine,
        scraperName: scraper.name,
        previousExecutionsCount: 0,
        nextScheduledExecutionAt:
          newRoutine.nextScheduledExecutionAt.getTime() || null,
        createdAt: newRoutine.createdAt.getTime(),
        updatedAt: newRoutine.updatedAt.getTime(),
      }

      return reply.status(201).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    "/routines/:id",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        body: upsertRoutineSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { scraperId } = request.body

      const routine = await fastify.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, id))
        .get()

      if (!routine) {
        return reply.status(404).send({
          error: "Routine not found",
        })
      }

      const scraper = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, scraperId))
        .get()

      if (!scraper) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }

      const [updatedRoutine] = await fastify.db
        .update(routinesTable)
        .set({
          ...request.body,
          nextScheduledExecutionAt:
            calculateNextScheduledExecutionAt({
              status: RoutineStatus.Active,
              scheduler: request.body.scheduler,
            }) ?? zeroDate,
        })
        .where(eq(routinesTable.id, id))
        .returning()

      const data: Routine = {
        ...updatedRoutine,
        scraperName: scraper.name,
        previousExecutionsCount: 0,
        nextScheduledExecutionAt:
          updatedRoutine.nextScheduledExecutionAt.getTime() || null,
        createdAt: updatedRoutine.createdAt.getTime(),
        updatedAt: updatedRoutine.updatedAt.getTime(),
      }

      return reply.status(200).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/routines/:id",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          204: z.void(),
          404: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const routine = await fastify.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, id))
        .get()

      if (!routine) {
        return reply.status(404).send({
          error: "Routine not found",
        })
      }

      await fastify.db.delete(routinesTable).where(eq(routinesTable.id, id))

      return reply.status(204).send()
    },
  )
}

const zeroDate = new Date(0)
