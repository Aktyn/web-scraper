import {
  RoutineExecutionResult,
  RoutineStatus,
  SchedulerType,
  type Routine,
  type UpsertRoutine,
} from "@web-scraper/common"
import { eq } from "drizzle-orm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { routinesTable } from "../../db/schema"
import { routineExecutionsTable } from "../../db/schema/routine-executions.schema"
import { setup, type TestModules } from "../../test/setup"
import * as helpers from "./helpers"
import { handleRoutineExecutionFinished } from "./routines.routes"

describe("Routines Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    vi.clearAllMocks()
    modules = await setup()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("GET /routines", () => {
    it("should return status 200 and paginated routines", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.length).toBe(10)
      expect(payload.page).toBe(0)
      expect(payload.pageSize).toBe(64)
      expect(payload.hasMore).toBe(false)
    })

    it("should respect pagination parameters", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines?page=1&pageSize=5",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.length).toBe(5)
      expect(payload.page).toBe(1)
      expect(payload.pageSize).toBe(5)
      expect(payload.hasMore).toBe(false)
    })

    it("should return routines with lastExecutionAt", async () => {
      const executionDate = new Date()
      await modules.dbModule.db.insert(routineExecutionsTable).values([
        {
          routineId: 1,
          result: RoutineExecutionResult.Success,
          createdAt: new Date(executionDate.getTime() - 10000),
        },
        {
          routineId: 1,
          result: RoutineExecutionResult.Success,
          createdAt: executionDate,
        },
      ])

      const response = await modules.api.inject({
        method: "GET",
        url: "/routines",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      const routine = payload.data.find((r: Routine) => r.id === 1)
      expect(routine).toBeDefined()
      expect(routine.lastExecutionAt).toBe(executionDate.getTime())
      const routine2 = payload.data.find((r: Routine) => r.id === 2)
      expect(routine2).toBeDefined()
      expect(routine2.lastExecutionAt).toBeNull()
    })

    it("should filter routines by status", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Active })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "GET",
        url: `/routines?status=${RoutineStatus.Active}`,
      })

      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.data.length).toBe(1)
      expect(payload.data[0].status).toBe(RoutineStatus.Active)
    })

    it("should filter routines by scraperName", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines?scraperName=Site",
      })

      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.data.length).toBe(1)
      expect(payload.data[0].scraperName).toBe("Site content scraper")
    })

    it("should filter routines by description", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ description: "test description" })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "GET",
        url: "/routines?description=test",
      })

      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.data.length).toBe(1)
      expect(payload.data[0].description).toBe("test description")
    })

    it("should sort routines by createdAt ascending", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines?sortBy=createdAt&sortOrder=asc",
      })

      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      const createdAts = payload.data.map((r: Routine) => r.createdAt)
      const sorted = [...createdAts].sort((a, b) => a - b)
      expect(createdAts).toEqual(sorted)
    })

    it("should sort routines by scraperName descending", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines?sortBy=scraperName&sortOrder=desc",
      })

      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      const names = payload.data.map((r: Routine) => r.scraperName)
      const sorted = [...names].sort((a, b) => b.localeCompare(a))
      expect(names).toEqual(sorted)
    })
  })

  describe("GET /routines/:id", () => {
    it("should return status 200 and the requested routine", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines/1",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.id).toBe(1)
      expect(payload.data.lastExecutionAt).toBeNull()
    })

    it("should return the routine with lastExecutionAt", async () => {
      const executionDate = new Date()
      await modules.dbModule.db.insert(routineExecutionsTable).values([
        {
          routineId: 1,
          result: RoutineExecutionResult.Success,
          createdAt: new Date(executionDate.getTime() - 10000),
        },
        {
          routineId: 1,
          result: RoutineExecutionResult.Success,
          createdAt: executionDate,
        },
      ])

      const response = await modules.api.inject({
        method: "GET",
        url: "/routines/1",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.id).toBe(1)
      expect(payload.data.lastExecutionAt).toBe(executionDate.getTime())
    })

    it("should return 404 if routine does not exist", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/routines/999",
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("POST /routines", () => {
    it("should return status 201 and the created routine", async () => {
      const newRoutine: UpsertRoutine = {
        scraperId: 1,
        description: "A new routine",
        scheduler: {
          type: SchedulerType.Interval,
          interval: 60000,
          startAt: new Date().getTime(),
          endAt: null,
        },
        iterator: null,
        pauseAfterNumberOfFailedExecutions: 3,
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines",
        payload: newRoutine,
      })

      expect(response.statusCode).toBe(201)
      const payload = JSON.parse(response.payload)
      expect(payload.data.description).toBe(newRoutine.description)

      const routineInDb = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, payload.data.id))
        .get()
      expect(routineInDb).toBeDefined()
      expect(routineInDb?.description).toBe(newRoutine.description)
    })

    it("should return 404 if scraper does not exist", async () => {
      const newRoutine: UpsertRoutine = {
        scraperId: 999,
        description: "A new routine",
        scheduler: {
          type: SchedulerType.Interval,
          interval: 60000,
          startAt: new Date().getTime(),
          endAt: null,
        },
        iterator: null,
        pauseAfterNumberOfFailedExecutions: null,
      }
      const response = await modules.api.inject({
        method: "POST",
        url: "/routines",
        payload: newRoutine,
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("PUT /routines/:id", () => {
    it("should return status 200 and the updated routine", async () => {
      const updatedRoutineData: UpsertRoutine = {
        scraperId: 1,
        description: "An updated routine",
        scheduler: {
          type: SchedulerType.Interval,
          interval: 120000,
          startAt: new Date().getTime(),
          endAt: null,
        },
        iterator: null,
        pauseAfterNumberOfFailedExecutions: 5,
      }
      const response = await modules.api.inject({
        method: "PUT",
        url: "/routines/1",
        payload: updatedRoutineData,
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.description).toBe(updatedRoutineData.description)

      const routineInDb = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb).toBeDefined()
      expect(routineInDb?.description).toBe(updatedRoutineData.description)
    })

    it("should return 404 if routine does not exist", async () => {
      const response = await modules.api.inject({
        method: "PUT",
        url: "/routines/999",
        payload: {
          scraperId: 1,
          status: RoutineStatus.Paused,
          description: "A new routine",
          scheduler: {
            type: SchedulerType.Interval,
            interval: 60000,
            startAt: new Date().getTime(),
            endAt: null,
          },
          iterator: null,
          pauseAfterNumberOfFailedExecutions: 3,
        },
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("DELETE /routines/:id", () => {
    it("should return status 204 and delete the routine", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/routines/1",
      })

      expect(response.statusCode).toBe(204)

      const routineInDb = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb).toBeUndefined()
    })

    it("should return 404 if routine does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/routines/999",
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("POST /routines/:id/pause", () => {
    it("should return status 200 and the paused routine", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Active })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/pause",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.status).toBe(RoutineStatus.Paused)
      expect(payload.data.nextScheduledExecutionAt).toBeNull()

      const routineInDb = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb?.status).toBe(RoutineStatus.Paused)
    })

    it("should return 409 if routine is not active", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Paused })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/pause",
      })

      expect(response.statusCode).toBe(409)
    })

    it("should return 409 if routine is executing", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Executing })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/pause",
      })

      expect(response.statusCode).toBe(409)
    })

    it("should return 404 if routine does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/999/pause",
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("POST /routines/:id/resume", () => {
    it("should return status 200 and the resumed routine", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Paused })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/resume",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.status).toBe(RoutineStatus.Active)
      expect(payload.data.nextScheduledExecutionAt).toBeGreaterThan(
        new Date().getTime(),
      )

      const routineInDb = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb?.status).toBe(RoutineStatus.Active)
    })

    it("should return 409 if routine is not paused", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Active })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/resume",
      })

      expect(response.statusCode).toBe(409)
    })

    it("should return 409 if routine is executing", async () => {
      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Executing })
        .where(eq(routinesTable.id, 1))

      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/1/resume",
      })

      expect(response.statusCode).toBe(409)
    })

    it("should return 404 if routine does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/routines/999/resume",
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe("handleRoutineExecutionFinished", () => {
    it("should mark execution as success and set routine to active", async () => {
      const routineId = 1
      const routineExecution = {
        id: 100,
        routineId,
        result: null,
        createdAt: new Date(),
      }
      const executionId = 200

      vi.spyOn(helpers, "getScraperExecutionResult").mockResolvedValue(
        RoutineExecutionResult.Success,
      )

      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Executing })
        .where(eq(routinesTable.id, routineId))

      await modules.dbModule.db
        .insert(routineExecutionsTable)
        .values(routineExecution)

      await handleRoutineExecutionFinished(
        modules.dbModule.db,
        modules.events,
        modules.logger,
        routineExecution,
        executionId,
      )

      const updatedExecution = await modules.dbModule.db
        .select()
        .from(routineExecutionsTable)
        .where(eq(routineExecutionsTable.id, routineExecution.id))
        .get()
      expect(updatedExecution?.result).toBe(RoutineExecutionResult.Success)

      const updatedRoutine = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, routineId))
        .get()
      expect(updatedRoutine?.status).toBe(RoutineStatus.Active)
    })

    it("should mark execution as failed when executionId is not provided", async () => {
      const routineId = 1
      const routineExecution = {
        id: 101,
        routineId,
        result: null,
        createdAt: new Date(),
      }

      await modules.dbModule.db
        .update(routinesTable)
        .set({ status: RoutineStatus.Executing })
        .where(eq(routinesTable.id, routineId))

      await modules.dbModule.db
        .insert(routineExecutionsTable)
        .values(routineExecution)

      await handleRoutineExecutionFinished(
        modules.dbModule.db,
        modules.events,
        modules.logger,
        routineExecution,
      )

      const updatedExecution = await modules.dbModule.db
        .select()
        .from(routineExecutionsTable)
        .where(eq(routineExecutionsTable.id, routineExecution.id))
        .get()
      expect(updatedExecution?.result).toBe(RoutineExecutionResult.Failed)
    })

    it("should pause routine if it reaches max number of failed executions", async () => {
      const routineId = 1
      const maxFailures = 2
      const routineExecution = {
        id: 102,
        routineId,
        result: null,
        createdAt: new Date(),
      }
      const executionId = 202

      await modules.dbModule.db
        .update(routinesTable)
        .set({
          status: RoutineStatus.Executing,
          pauseAfterNumberOfFailedExecutions: maxFailures,
        })
        .where(eq(routinesTable.id, routineId))

      await modules.dbModule.db
        .insert(routineExecutionsTable)
        .values(routineExecution)

      // Mock failure for the current execution
      vi.spyOn(helpers, "getScraperExecutionResult").mockResolvedValue(
        RoutineExecutionResult.Failed,
      )

      // Insert previous failures to reach the limit
      await modules.dbModule.db.insert(routineExecutionsTable).values([
        {
          routineId,
          result: RoutineExecutionResult.Failed,
          createdAt: new Date(Date.now() - 10000),
        },
        {
          routineId,
          result: RoutineExecutionResult.Failed,
          createdAt: new Date(Date.now() - 20000),
        },
      ])

      await handleRoutineExecutionFinished(
        modules.dbModule.db,
        modules.events,
        modules.logger,
        routineExecution,
        executionId,
      )

      const updatedRoutine = await modules.dbModule.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, routineId))
        .get()
      expect(updatedRoutine?.status).toBe(
        RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
      )
    })
  })
})
