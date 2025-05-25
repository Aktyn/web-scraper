import { type CreateUserDataStore, SqliteColumnType } from "@web-scraper/common"
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
                notNull: false,
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

  describe("POST /user-data-stores", () => {
    it("should create a new user data store and return status 201", async () => {
      const newStore: CreateUserDataStore = {
        name: "Test Store",
        description: "A test data store",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.REAL,
            notNull: false,
            defaultValue: 3.14,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores",
        payload: newStore,
      })

      expect(response.statusCode).toBe(201)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        name: "Test Store",
        description: "A test data store",
        recordsCount: 0,
      })
      expect(responseData.data.tableName).toMatch(/^test_store_[a-z0-9]+$/)
      expect(responseData.data.columns).toEqual([
        {
          name: "id",
          type: SqliteColumnType.INTEGER,
          notNull: true,
          defaultValue: null,
        },
        {
          name: "noop",
          type: SqliteColumnType.REAL,
          notNull: false,
          defaultValue: "3.14",
        },
      ])
    })

    it("should create a new user data store without description", async () => {
      const newStore: CreateUserDataStore = {
        name: "Test Store No Desc",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.BOOLEAN,
            notNull: true,
            defaultValue: true,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores",
        payload: newStore,
      })

      expect(response.statusCode).toBe(201)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data.description).toBeNull()
    })

    it("should return status 409 if a store with the same name already exists", async () => {
      const newStore: CreateUserDataStore = {
        name: "Personal credentials",
        description: "Duplicate name",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.NUMERIC,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores",
        payload: newStore,
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.payload)).toEqual({
        error: "A data store with this name already exists",
      })
    })

    it("should return status 400 for invalid input", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores",
        payload: {
          name: "",
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe("PUT /user-data-stores/:tableName", () => {
    it("should update an existing user data store and return status 200", async () => {
      const updateData = {
        name: "Updated Personal Credentials",
        description: "Updated description",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        tableName: "personal_credentials_random_string",
        name: "Updated Personal Credentials",
        description: "Updated description",
        recordsCount: 2,
      })
    })

    it("should update only the name when description is not provided", async () => {
      const updateData = {
        name: "Only Name Updated",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data.name).toBe("Only Name Updated")
      expect(responseData.data.description).toBe("Personal credentials for various websites")
    })

    it("should return status 404 if the data store does not exist", async () => {
      const updateData = {
        name: "Non-existent Store",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/non_existent_table",
        payload: updateData,
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })

    it("should return status 409 if updating to a name that already exists", async () => {
      await modules.api.inject({
        method: "POST",
        url: "/user-data-stores",
        payload: {
          name: "Another Store",
          description: "Another test store",
          columns: [
            {
              name: "noop",
              type: SqliteColumnType.NUMERIC,
            },
          ],
        },
      })

      const updateData = {
        name: "Another Store",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: updateData,
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.payload)).toEqual({
        error: "A data store with this name already exists",
      })
    })

    it("should return status 400 for invalid input", async () => {
      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: {
          name: "",
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe("DELETE /user-data-stores/:tableName", () => {
    it("should delete an existing user data store and return status 204", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/personal_credentials_random_string",
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores",
      })

      const getData = JSON.parse(getResponse.payload)
      expect(getData.data).toEqual([])
    })

    it("should return status 404 if the data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/non_existent_table",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })
  })
})
