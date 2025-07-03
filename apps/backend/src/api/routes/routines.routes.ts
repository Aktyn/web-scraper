import {
  type Routine,
  type ScheduledScraperExecution,
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  calculateNextScheduledExecutionAt,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  routineSchema,
  RoutineStatus,
  scheduledScraperExecutionSchema,
  upsertRoutineSchema,
} from "@web-scraper/common"
import {
  type InferSelectModel,
  and,
  desc,
  eq,
  isNotNull,
  not,
} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { routinesTable, scrapersTable } from "../../db/schema"
import type { ApiModuleContext } from "../api.module"
import { Scraper } from "@web-scraper/core"
import { executeNewScraper } from "../../handlers/scraper.handler"
import { joinScraperWithDataSources } from "./helpers"

export async function routinesRoutes(
  fastify: FastifyInstance,
  { logger, events, config }: ApiModuleContext,
) {
  const paramsWithRoutineIdSchema = z.object({
    id: z.coerce.number().int().min(1),
  })

  // Fix routines that were executing when the backend was restarted
  const result = await fastify.db
    .update(routinesTable)
    .set({ status: RoutineStatus.Active })
    .where(eq(routinesTable.status, RoutineStatus.Executing))

  if (result.rowsAffected > 0) {
    logger.info(
      `${result.rowsAffected} routines were executing when the backend was restarted and were set back to active`,
    )
  }

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
        .map(({ routine, scraper }) => parseRoutineFromDb(routine, scraper))

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

      return reply
        .status(200)
        .send({ data: parseRoutineFromDb(routine, scraper) })
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
            calculateNextScheduledExecutionAt(
              {
                status: RoutineStatus.Active,
                scheduler: request.body.scheduler,
              },
              null,
            ) ?? zeroDate,
        })
        .returning()

      return reply
        .status(201)
        .send({ data: parseRoutineFromDb(newRoutine, scraper) })
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
            calculateNextScheduledExecutionAt(
              {
                status: RoutineStatus.Active,
                scheduler: request.body.scheduler,
              },
              routine.lastExecutionAt,
            ) ?? zeroDate,
        })
        .where(eq(routinesTable.id, id))
        .returning()

      return reply
        .status(200)
        .send({ data: parseRoutineFromDb(updatedRoutine, scraper) })
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

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/routines/:id/run",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
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

      const scraperResponse = await fastify.db
        .select()
        .from(scrapersTable)
        .where(eq(scrapersTable.id, routine.scraperId))
        .get()

      if (!scraperResponse) {
        return reply.status(404).send({
          error: "Scraper not found",
        })
      }
      // NOTE: scrapersTable.id and scrapersTable.name are unique columns
      const scraperIdentifier =
        `${scraperResponse.id}-${scraperResponse.name}` as const

      if (Scraper.getInstance(scraperIdentifier)) {
        return reply.status(400).send({
          error: "Scraper is already running",
        })
      }

      const { data, error } = await handleRoutineStatusChange(
        fastify.db,
        id,
        RoutineStatus.Executing,
        [RoutineStatus.Active],
        "Routine is not active",
      )

      if (error) {
        return reply.status(error.statusCode).send({ error: error.message })
      }

      const scraperData = await joinScraperWithDataSources(
        fastify.db,
        scraperResponse,
      )

      executeNewScraper(
        scraperResponse.id,
        scraperResponse.name,
        scraperData,
        routine.iterator,
        {
          db: fastify.db,
          logger,
          events,
          config,
        },
      )
        .catch(logger.error)
        //TODO: implement logic of pausing routine after reaching max number of failed executions
        .finally(() =>
          handleRoutineExecutionFinished(fastify.db, logger, routine.id),
        )

      return reply.status(200).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/routines/:id/pause",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { data, error } = await handleRoutineStatusChange(
        fastify.db,
        id,
        RoutineStatus.Paused,
        [RoutineStatus.Active],
        "Routine is not active",
      )

      if (error) {
        return reply.status(error.statusCode).send({ error: error.message })
      }

      return reply.status(200).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/routines/:id/resume",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { data, error } = await handleRoutineStatusChange(
        fastify.db,
        id,
        RoutineStatus.Active,
        [
          RoutineStatus.Paused,
          RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
        ],
        "Routine is not paused",
      )

      if (error) {
        return reply.status(error.statusCode).send({ error: error.message })
      }

      return reply.status(200).send({ data })
    },
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/routines/scheduled-executions",
    {
      schema: {
        querystring: apiPaginationQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(scheduledScraperExecutionSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize } = request.query

      const scheduledExecutions = await fastify.db
        .select({
          routine: routinesTable,
          scraper: scrapersTable,
        })
        .from(routinesTable)
        .where(
          and(
            eq(routinesTable.status, RoutineStatus.Active),
            isNotNull(routinesTable.nextScheduledExecutionAt),
            not(eq(routinesTable.nextScheduledExecutionAt, zeroDate)),
          ),
        )
        .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
        .orderBy(desc(routinesTable.nextScheduledExecutionAt))
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data: ScheduledScraperExecution[] = scheduledExecutions
        .slice(0, pageSize)
        .map(({ routine, scraper }) => ({
          routineId: routine.id,
          scraperId: scraper.id,
          scraperName: scraper.name,
          iterator: routine.iterator,
          nextScheduledExecutionAt: routine.nextScheduledExecutionAt.getTime(),
        }))

      return reply.status(200).send({
        data,
        page,
        pageSize,
        hasMore: scheduledExecutions.length > pageSize,
      })
    },
  )
}

const zeroDate = new Date(0)

function parseRoutineFromDb(
  routine: InferSelectModel<typeof routinesTable>,
  scraper: Pick<InferSelectModel<typeof scrapersTable>, "name">,
) {
  return {
    ...routine,
    scraperName: scraper.name,
    previousExecutionsCount: 0,
    nextScheduledExecutionAt:
      routine.nextScheduledExecutionAt.getTime() || null,
    lastExecutionAt: routine.lastExecutionAt?.getTime() ?? null,
    createdAt: routine.createdAt.getTime(),
    updatedAt: routine.updatedAt.getTime(),
  }
}

async function handleRoutineStatusChange(
  db: ApiModuleContext["db"],
  routineId: number,
  newStatus: RoutineStatus,
  allowedCurrentStatuses: RoutineStatus[],
  statusErrorMessage: string,
) {
  const routineResult = await db
    .select({
      routine: routinesTable,
      scraper: scrapersTable,
    })
    .from(routinesTable)
    .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
    .where(eq(routinesTable.id, routineId))
    .get()

  if (!routineResult) {
    return { error: { statusCode: 404, message: "Routine not found" } }
  }

  const { routine, scraper } = routineResult

  if (
    routine.status === RoutineStatus.Executing &&
    !allowedCurrentStatuses.includes(RoutineStatus.Executing)
  ) {
    return {
      error: {
        statusCode: 409,
        message: "Cannot change status of an executing routine",
      },
    }
  }

  if (!allowedCurrentStatuses.includes(routine.status)) {
    return {
      error: {
        statusCode: 409,
        message: statusErrorMessage,
      },
    }
  }

  const [updatedRoutine] = await db
    .update(routinesTable)
    .set({
      status: newStatus,
      nextScheduledExecutionAt:
        calculateNextScheduledExecutionAt(
          {
            status: newStatus,
            scheduler: routine.scheduler,
          },
          routine.lastExecutionAt,
        ) ?? zeroDate,
    })
    .where(eq(routinesTable.id, routineId))
    .returning()

  return { data: parseRoutineFromDb(updatedRoutine, scraper) }
}

async function handleRoutineExecutionFinished(
  db: ApiModuleContext["db"],
  logger: ApiModuleContext["logger"],
  routineId: number,
) {
  const { error } = await handleRoutineStatusChange(
    db,
    routineId,
    RoutineStatus.Active,
    [RoutineStatus.Executing],
    "Routine is not executing",
  )

  if (error) {
    logger.error(error.message)
  }
}
