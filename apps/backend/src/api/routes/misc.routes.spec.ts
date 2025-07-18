import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { routinesTable } from "../../db/schema"
import { setup, type TestModules } from "../../test/setup"

describe("Misc Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    vi.clearAllMocks()
    modules = await setup()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("POST /reset-database", () => {
    it("should return status 200 and reset the database", async () => {
      const routinesBefore = await modules.dbModule.db
        .select()
        .from(routinesTable)
      expect(routinesBefore.length).toBeGreaterThan(0)

      const response = await modules.api.inject({
        method: "POST",
        url: "/reset-database",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toBeNull()

      const routinesAfter = await modules.dbModule.db
        .select()
        .from(routinesTable)
      expect(routinesAfter.length).toBe(0)
    })
  })

  describe("POST /seed-database", () => {
    it("should return status 200 and seed the database", async () => {
      // First reset the database to have a clean state
      await modules.api.inject({
        method: "POST",
        url: "/reset-database",
      })

      const routinesBefore = await modules.dbModule.db
        .select()
        .from(routinesTable)
      expect(routinesBefore.length).toBe(0)

      const response = await modules.api.inject({
        method: "POST",
        url: "/seed-database",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toBeNull()

      const routinesAfter = await modules.dbModule.db
        .select()
        .from(routinesTable)
      expect(routinesAfter.length).toBeGreaterThan(0)
    })
  })
})
