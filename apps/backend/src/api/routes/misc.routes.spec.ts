import { beforeEach, describe, expect, it, vi } from "vitest"
import { preferencesTable, userDataStoresTable } from "../../db/schema"
import { setup, type TestModules } from "../../test/setup"

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
      expect(JSON.parse(response.payload)).toEqual({
        data: [{ key: "foo", value: "bar" }],
      })
    })

    it("should return status 200 and an empty array if no preferences exist", async () => {
      await modules.db.delete(preferencesTable)

      const response = await modules.api.inject({
        method: "GET",
        url: "/preferences",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: [],
      })
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

  describe("GET /user-data-stores", () => {
    it("should return status 200 and user data stores from the database", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?pageSize=32",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: [
          {
            tableName: "personal_credentials_random_string",
            name: "Personal credentials",
            description: "Personal credentials for various websites",
            recordsCount: 2,
            columns: [
              {
                name: "id",
                type: "INTEGER",
                notNull: true,
                defaultValue: null,
              },
              {
                name: "origin",
                type: "TEXT",
                notNull: true,
                defaultValue: null,
              },
              {
                name: "username",
                type: "TEXT",
                notNull: false,
                defaultValue: null,
              },
              {
                name: "email",
                type: "TEXT",
                notNull: true,
                defaultValue: null,
              },
              {
                name: "password",
                type: "TEXT",
                notNull: true,
                defaultValue: null,
              },
            ],
          },
        ],
        page: 0,
        pageSize: 32,
        hasMore: false,
      })
    })

    it("should return status 200 and an empty array if no user data stores exist", async () => {
      await modules.db.delete(userDataStoresTable)

      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: [],
        page: 0,
        pageSize: 64,
        hasMore: false,
      })
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "select").mockRejectedValue(new Error("Database error"))

      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores",
      })

      expect(response.statusCode).toBe(500)
    })
  })
})
