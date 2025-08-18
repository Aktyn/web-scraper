import {
  type Routine,
  type ScheduledScraperExecution,
  apiErrorResponseSchema,
  apiPaginationQuerySchema,
  calculateNextScheduledExecutionAt,
  getApiPaginatedResponseSchema,
  getApiResponseSchema,
  RoutineExecutionResult,
  routineSchema,
  RoutineStatus,
  runUnsafeAsync,
  scheduledScraperExecutionSchema,
  SubscriptionMessageType,
  upsertRoutineSchema,
  routineQuerySchema,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import {
  type SQL,
  type InferSelectModel,
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  not,
  sql,
} from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { routinesTable, scrapersTable } from "../../db/schema"
import { routineExecutionsTable } from "../../db/schema/routine-executions.schema"
import { executeNewScraper } from "../../handlers/scraper.handler"
import type { ApiModuleContext } from "../api.module"
import {
  getScraperExecutionResult,
  joinScraperWithDataSources,
} from "./helpers"

export async function routinesRoutes(
  fastify: FastifyInstance,
  { dbModule, logger, events, config }: ApiModuleContext,
) {
  const paramsWithRoutineIdSchema = z.object({
    id: z.coerce.number().int().min(1),
  })

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/routines",
    {
      schema: {
        querystring: routineQuerySchema,
        response: {
          200: getApiPaginatedResponseSchema(routineSchema),
          400: apiErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const {
        page,
        pageSize,
        status,
        scraperName,
        description,
        sortBy,
        sortOrder,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo,
      } = request.query

      const filters = []
      if (status) {
        filters.push(eq(routinesTable.status, status))
      }
      if (scraperName) {
        filters.push(
          sql`LOWER(${scrapersTable.name}) LIKE LOWER(${"%" + scraperName + "%"})`,
        )
      }
      if (description) {
        filters.push(
          sql`LOWER(${routinesTable.description}) LIKE LOWER(${"%" + description + "%"})`,
        )
      }
      if (createdAtFrom) {
        filters.push(
          sql`${routinesTable.createdAt} >= ${new Date(createdAtFrom)}`,
        )
      }
      if (createdAtTo) {
        filters.push(
          sql`${routinesTable.createdAt} <= ${new Date(createdAtTo)}`,
        )
      }
      if (updatedAtFrom) {
        filters.push(
          sql`${routinesTable.updatedAt} >= ${new Date(updatedAtFrom)}`,
        )
      }
      if (updatedAtTo) {
        filters.push(
          sql`${routinesTable.updatedAt} <= ${new Date(updatedAtTo)}`,
        )
      }

      const orderDirection = sortOrder === "asc" ? asc : desc
      let orderBy: SQL<unknown>

      switch (sortBy) {
        case "scraperName":
          orderBy = orderDirection(scrapersTable.name)
          break
        case "status":
          orderBy = orderDirection(routinesTable.status)
          break
        case "description":
          orderBy = orderDirection(routinesTable.description)
          break
        case "createdAt":
          orderBy = orderDirection(routinesTable.createdAt)
          break
        case "updatedAt":
          orderBy = orderDirection(routinesTable.updatedAt)
          break
        case undefined:
          orderBy = desc(routinesTable.updatedAt)
          break
      }

      const routines = await fastify.db
        .select({
          routine: routinesTable,
          scraper: scrapersTable,
          lastExecutionAt: sql<number>`(select ${routineExecutionsTable.createdAt} from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            routinesTable.id,
          )} order by ${desc(routineExecutionsTable.createdAt)} limit 1)`,
          previousExecutionsCount: sql<number>`(select count(*) from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            routinesTable.id,
          )})`,
        })
        .from(routinesTable)
        .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(orderBy)
        .limit(pageSize + 1)
        .offset(page * pageSize)

      const data: Routine[] = routines
        .slice(0, pageSize)
        .map(({ routine, lastExecutionAt, previousExecutionsCount, scraper }) =>
          parseRoutineFromDb(
            { ...routine, lastExecutionAt, previousExecutionsCount },
            scraper,
          ),
        )

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
          lastExecutionAt: sql<number>`(select ${routineExecutionsTable.createdAt} from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            id,
          )} order by ${desc(routineExecutionsTable.createdAt)} limit 1)`,
          previousExecutionsCount: sql<number>`(select count(*) from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            id,
          )})`,
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

      const { routine, scraper, lastExecutionAt, previousExecutionsCount } =
        routineResult

      return reply.status(200).send({
        data: parseRoutineFromDb(
          { ...routine, lastExecutionAt, previousExecutionsCount },
          scraper,
        ),
      })
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

      return reply.status(201).send({
        data: parseRoutineFromDb(
          { ...newRoutine, lastExecutionAt: null },
          scraper,
        ),
      })
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
        .select({
          ...getTableColumns(routinesTable),
          lastExecutionAt: sql<number>`(select ${routineExecutionsTable.createdAt} from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            id,
          )} order by ${desc(routineExecutionsTable.createdAt)} limit 1)`,
          previousExecutionsCount: sql<number>`(select count(*) from ${routineExecutionsTable} where ${eq(
            routineExecutionsTable.routineId,
            id,
          )})`,
        })
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

      return reply.status(200).send({
        data: parseRoutineFromDb(
          {
            ...updatedRoutine,
            lastExecutionAt: routine.lastExecutionAt,
            previousExecutionsCount: routine.previousExecutionsCount,
          },
          scraper,
        ),
      })
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
    "/routines/:id/execute",
    {
      schema: {
        params: paramsWithRoutineIdSchema,
        response: {
          200: getApiResponseSchema(routineSchema),
          400: apiErrorResponseSchema,
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
        events,
        id,
        RoutineStatus.Executing,
        [RoutineStatus.Active],
        "Routine is not active",
      )

      const newRoutineExecution = await fastify.db
        .insert(routineExecutionsTable)
        .values({
          routineId: id,
          result: null,
        })
        .returning()
        .get()

      if (error) {
        return reply
          .status(error.statusCode as 400)
          .send({ error: error.message })
      }

      const scraperData = await joinScraperWithDataSources(
        fastify.db,
        scraperResponse,
      )

      const onRoutineExecutionFinished = (executionId?: number) =>
        runUnsafeAsync(
          () =>
            handleRoutineExecutionFinished(
              fastify.db,
              events,
              logger,
              newRoutineExecution,
              executionId,
            ),
          logger.error,
        )

      executeNewScraper(
        scraperResponse.id,
        scraperResponse.name,
        scraperData,
        routine.iterator,
        {
          dbModule,
          logger,
          events,
          config,
          routineId: id,
        },
      )
        .then((executionId) => {
          void onRoutineExecutionFinished(executionId)
        })
        .catch((error) => {
          logger.error(error)
          void onRoutineExecutionFinished()
        })

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
        events,
        id,
        RoutineStatus.Paused,
        [RoutineStatus.Active],
        "Routine is not active",
      )

      if (error) {
        return reply
          .status(error.statusCode as 409)
          .send({ error: error.message })
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
        events,
        id,
        RoutineStatus.Active,
        [
          RoutineStatus.Paused,
          RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
        ],
        "Routine is not paused",
      )

      if (error) {
        return reply
          .status(error.statusCode as 409)
          .send({ error: error.message })
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
        .orderBy(asc(routinesTable.nextScheduledExecutionAt))
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
  routine: InferSelectModel<typeof routinesTable> & {
    lastExecutionAt: number | null
    previousExecutionsCount?: number
  },
  scraper: Pick<InferSelectModel<typeof scrapersTable>, "name">,
) {
  return {
    previousExecutionsCount: 0,
    ...routine,
    scraperName: scraper.name,
    nextScheduledExecutionAt:
      routine.nextScheduledExecutionAt.getTime() || null,
    lastExecutionAt: routine.lastExecutionAt ?? null,
    createdAt: routine.createdAt.getTime(),
    updatedAt: routine.updatedAt.getTime(),
  }
}

async function handleRoutineStatusChange(
  db: ApiModuleContext["dbModule"]["db"],
  events: ApiModuleContext["events"],
  routineId: number,
  newStatus: RoutineStatus,
  allowedCurrentStatuses: RoutineStatus[],
  statusErrorMessage: string,
) {
  const routineResult = await db
    .select({
      routine: routinesTable,
      scraper: scrapersTable,
      lastExecutionAt: sql<number>`(select ${routineExecutionsTable.createdAt} from ${routineExecutionsTable} where ${eq(
        routineExecutionsTable.routineId,
        routineId,
      )} order by ${desc(routineExecutionsTable.createdAt)} limit 1)`,
      previousExecutionsCount: sql<number>`(select count(*) from ${routineExecutionsTable} where ${eq(
        routineExecutionsTable.routineId,
        routineId,
      )})`,
    })
    .from(routinesTable)
    .innerJoin(scrapersTable, eq(routinesTable.scraperId, scrapersTable.id))
    .where(eq(routinesTable.id, routineId))
    .get()

  if (!routineResult) {
    return { error: { statusCode: 404, message: "Routine not found" } }
  }

  const { routine, scraper, lastExecutionAt, previousExecutionsCount } =
    routineResult

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
          lastExecutionAt,
        ) ?? zeroDate,
    })
    .where(eq(routinesTable.id, routineId))
    .returning()

  const data = parseRoutineFromDb(
    { ...updatedRoutine, lastExecutionAt, previousExecutionsCount },
    scraper,
  )

  events.emit("broadcast", {
    type: SubscriptionMessageType.RoutineUpdated,
    routine: data,
  })

  return { data }
}

async function handleRoutineExecutionFinished(
  db: ApiModuleContext["dbModule"]["db"],
  events: ApiModuleContext["events"],
  logger: ApiModuleContext["logger"],
  routineExecution: InferSelectModel<typeof routineExecutionsTable>,
  executionId?: number,
) {
  const result = executionId
    ? await getScraperExecutionResult(
        db,
        executionId,
        routineExecution.routineId,
      )
    : RoutineExecutionResult.Failed

  await db
    .update(routineExecutionsTable)
    .set({
      result,
    })
    .where(eq(routineExecutionsTable.id, routineExecution.id))

  const { data, error } = await handleRoutineStatusChange(
    db,
    events,
    routineExecution.routineId,
    RoutineStatus.Active,
    [RoutineStatus.Executing],
    "Routine is not executing",
  )

  if (error) {
    logger.error(error.message)
  }

  if (
    typeof data?.pauseAfterNumberOfFailedExecutions === "number" &&
    data.pauseAfterNumberOfFailedExecutions > 0
  ) {
    // Pause routine if it reaches max number of failed executions in a row

    const recentRoutineExecutionResults = await db
      .select({
        result: routineExecutionsTable.result,
      })
      .from(routineExecutionsTable)
      .where(
        and(
          eq(routineExecutionsTable.routineId, data.id),
          isNotNull(routineExecutionsTable.result),
        ),
      )
      .orderBy(desc(routineExecutionsTable.createdAt))
      .limit(data.pauseAfterNumberOfFailedExecutions)

    if (
      recentRoutineExecutionResults.every(
        ({ result }) => result === RoutineExecutionResult.Failed,
      )
    ) {
      logger.info(
        `Pausing routine ${data.id} due to max number of failed executions`,
      )
      await db
        .update(routinesTable)
        .set({ status: RoutineStatus.PausedDueToMaxNumberOfFailedExecutions })
        .where(eq(routinesTable.id, data.id))

      events.emit("broadcast", {
        type: SubscriptionMessageType.RoutineUpdated,
        routine: {
          ...data,
          status: RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
        },
      })
    }
  }
}
