import { beforeEach, describe, expect, it, vi } from "vitest"
import { setup, type TestModules } from "../../test/setup"
import { preferencesTable } from "../../db/schema"

describe("Misc Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    modules = await setup()
  })

  describe("GET /preferences", () => {
    it("should return status 200 and preferences from the database", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/preferences",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual([{ key: "foo", value: "bar" }])
    })

    it("should return status 200 and an empty array if no preferences exist", async () => {
      await modules.db.delete(preferencesTable)

      const response = await modules.api.inject({
        method: "GET",
        url: "/preferences",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual([])
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "select").mockRejectedValue(new Error("Database error"))

      const response = await modules.api.inject({
        method: "GET",
        url: "/preferences",
      })

      expect(response.statusCode).toBe(500)
    })
  })
})
