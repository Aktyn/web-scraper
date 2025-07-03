import {
  type Routine,
  RoutineExecutionResult,
  RoutineStatus,
  SchedulerType,
  type UpsertRoutine,
} from "@web-scraper/common"
import { eq } from "drizzle-orm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { routinesTable } from "../../db/schema"
import { routineExecutionsTable } from "../../db/schema/routine-executions.schema"
import { setup, type TestModules } from "../../test/setup"

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
      await modules.db.insert(routineExecutionsTable).values([
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
      await modules.db.insert(routineExecutionsTable).values([
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

      const routineInDb = await modules.db
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

      const routineInDb = await modules.db
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

      const routineInDb = await modules.db
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
      await modules.db
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

      const routineInDb = await modules.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb?.status).toBe(RoutineStatus.Paused)
    })

    it("should return 409 if routine is not active", async () => {
      await modules.db
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
      await modules.db
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
      await modules.db
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

      const routineInDb = await modules.db
        .select()
        .from(routinesTable)
        .where(eq(routinesTable.id, 1))
        .get()
      expect(routineInDb?.status).toBe(RoutineStatus.Active)
    })

    it("should return 409 if routine is not paused", async () => {
      await modules.db
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
      await modules.db
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
})
