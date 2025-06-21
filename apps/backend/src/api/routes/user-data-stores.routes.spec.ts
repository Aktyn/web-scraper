import {
  type ApiPaginatedResponse,
  type CreateUserDataStore,
  SqliteColumnType,
} from "@web-scraper/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { userDataStoresTable } from "../../db/schema"
import { setup, type TestModules } from "../../test/setup"

describe("User Data Stores Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    modules = await setup()
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
                type: SqliteColumnType.INTEGER,
                notNull: true,
              },
              {
                name: "origin",
                type: SqliteColumnType.TEXT,
                notNull: true,
              },
              {
                name: "username",
                type: SqliteColumnType.TEXT,
              },
              {
                name: "email",
                type: SqliteColumnType.TEXT,
              },
              {
                name: "password",
                type: SqliteColumnType.TEXT,
                notNull: true,
              },
            ],
          },
          {
            tableName: "example_test_of_saving_page_content",
            name: "Example test of saving page content",
            description: "Example test of saving page content",
            recordsCount: 0,
            columns: [
              { name: "id", type: SqliteColumnType.INTEGER, notNull: true },
              {
                name: "Scraper text",
                type: SqliteColumnType.TEXT,
                notNull: true,
                defaultValue: null,
              },
              {
                name: "Update time",
                type: SqliteColumnType.TIMESTAMP,
                notNull: true,
                defaultValue: 0,
              },
            ],
          },
          {
            tableName: "crypto_prices",
            name: "Crypto prices",
            description: null,
            recordsCount: 4,
            columns: [
              {
                name: "id",
                notNull: true,
                type: "INTEGER",
              },
              {
                name: "Cryptocurrency",
                notNull: true,
                type: "TEXT",
              },
              {
                name: "Price",
                notNull: false,
                type: "REAL",
              },
              {
                defaultValue: 0,
                name: "Last update",
                notNull: true,
                type: "TIMESTAMP",
              },
            ],
          },
          {
            name: "Data markers",
            tableName: "data_markers",
            description: null,
            recordsCount: 1,
            columns: [
              {
                name: "id",
                notNull: true,
                type: SqliteColumnType.INTEGER,
              },
              {
                name: "Name",
                notNull: true,
                type: SqliteColumnType.TEXT,
              },
              {
                name: "Content",
                type: SqliteColumnType.TEXT,
              },
            ],
          },
          {
            name: "Brain FM accounts",
            tableName: "brain_fm_accounts",
            description: null,
            recordsCount: 0,
            columns: [
              { name: "id", type: SqliteColumnType.INTEGER, notNull: true },
              {
                name: "Name",
                type: SqliteColumnType.TEXT,
              },
              {
                name: "Email",
                type: SqliteColumnType.TEXT,
                notNull: true,
              },
              {
                name: "Password",
                type: SqliteColumnType.TEXT,
                notNull: true,
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
      vi.spyOn(modules.db, "select").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores",
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe("GET /user-data-stores/:tableName", () => {
    it("should return status 200 and the user data store if it exists", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/personal_credentials_random_string",
      })
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: {
          tableName: "personal_credentials_random_string",
          name: "Personal credentials",
          description: "Personal credentials for various websites",
          recordsCount: 2,
          columns: [
            { name: "id", type: SqliteColumnType.INTEGER, notNull: true },
            { name: "origin", type: SqliteColumnType.TEXT, notNull: true },
            { name: "username", type: SqliteColumnType.TEXT },
            { name: "email", type: SqliteColumnType.TEXT },
            { name: "password", type: SqliteColumnType.TEXT, notNull: true },
          ],
        },
      })
    })

    it("should return 404 if the data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/non_existent_table",
      })
      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })
  })

  describe("GET /user-data-stores/:tableName/records", () => {
    it("should return status 200 and store data from the database", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/personal_credentials_random_string/records",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: [
          {
            id: 1,
            origin: "https://example.com/",
            username: "noop",
            email: "noop@gmail.com",
            password: "Noop123!",
          },
          {
            id: 2,
            origin: "https://www.pepper.pl",
            username: "pultetista",
            email: "pultetista@gufum.com",
            password: "pultetista@gufum.com",
          },
        ],
        page: 0,
        pageSize: 64,
        hasMore: false,
      })
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
        },
        {
          name: "noop",
          type: SqliteColumnType.REAL,
          notNull: false,
          defaultValue: 3.14,
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
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.NUMERIC,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        tableName: expect.stringMatching(
          /^updated_personal_credentials_[a-z0-9]+$/,
        ),
        name: "Updated Personal Credentials",
        description: "Updated description",
        recordsCount: 0, //Due to columns change, the data is lost
      })
    })

    it("should return empty description if not provided", async () => {
      const updateData = {
        name: "Only Name Updated",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.NUMERIC,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data.name).toBe("Only Name Updated")
      expect(responseData.data.description).toBe(null)
    })

    it("should return status 404 if the data store does not exist", async () => {
      const updateData = {
        name: "Non-existent Store",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.NUMERIC,
          },
        ],
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
        description: "Another test store",
        columns: [
          {
            name: "noop",
            type: SqliteColumnType.NUMERIC,
          },
        ],
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

      const getData = JSON.parse(
        getResponse.payload,
      ) as ApiPaginatedResponse<object>
      expect(getData.data.length).toBe(4)
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

  describe("POST /user-data-stores/:tableName/records", () => {
    it("should create a new record and return status 201", async () => {
      const newRecord = {
        origin: "https://test.com",
        username: "test_user",
        email: "test@example.com",
        password: "test_pass123",
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/personal_credentials_random_string/records",
        payload: newRecord,
      })

      expect(response.statusCode).toBe(201)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        id: expect.any(Number),
        origin: "https://test.com",
        username: "test_user",
        email: "test@example.com",
        password: "test_pass123",
      })
    })

    it("should return status 404 if the data store does not exist", async () => {
      const newRecord = {
        origin: "https://test.com",
        username: "test_user",
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/non_existent_table/records",
        payload: newRecord,
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })
  })

  describe("DELETE /user-data-stores/:tableName/records", () => {
    it("should delete all existing records and return status 204", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/personal_credentials_random_string/records",
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/personal_credentials_random_string/records",
      })

      const getData = JSON.parse(getResponse.payload)
      expect(getData.data).toHaveLength(0)
    })

    it("should return status 404 if the data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/non_existent_table/records",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })
  })

  describe("PUT /user-data-stores/:tableName/records/:id", () => {
    it("should update an existing record and return status 200", async () => {
      const updateData = {
        origin: "https://updated.com",
        username: "updated_user",
        email: "updated@example.com",
        password: "updated_pass123",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string/records/1",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        id: 1,
        origin: "https://updated.com",
        username: "updated_user",
        email: "updated@example.com",
        password: "updated_pass123",
      })
    })

    it("should return status 404 if the data store does not exist", async () => {
      const updateData = {
        origin: "https://test.com",
        username: "test_user",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/non_existent_table/records/1",
        payload: updateData,
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })

    it("should return status 404 if the record does not exist", async () => {
      const updateData = {
        origin: "https://test.com",
        username: "test_user",
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/user-data-stores/personal_credentials_random_string/records/999",
        payload: updateData,
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Record not found",
      })
    })
  })

  describe("DELETE /user-data-stores/:tableName/records/:id", () => {
    it("should delete an existing record and return status 204", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/personal_credentials_random_string/records/2",
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/personal_credentials_random_string/records",
      })

      const getData = JSON.parse(getResponse.payload)
      expect(getData.data).toHaveLength(1)
      expect(getData.data[0].id).toBe(1)
    })

    it("should return status 404 if the data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/non_existent_table/records/1",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Data store not found",
      })
    })

    it("should return status 404 if the record does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/personal_credentials_random_string/records/999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Record not found",
      })
    })
  })
})
