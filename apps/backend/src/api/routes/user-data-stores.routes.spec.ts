import {
  type ApiPaginatedResponse,
  type CreateUserDataStore,
  SqliteColumnType,
} from "@web-scraper/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { userDataStoresTable } from "../../db/schema"
import { setup, type TestModules } from "../../test/setup"
//@ts-expect-error No types for this package
import dialog from "node-file-dialog"
import fs from "fs"

vi.mock("node-file-dialog", () => ({
  default: vi.fn(),
}))

vi.mock("fs", async () => {
  const actualFs = await vi.importActual<typeof fs>("fs")
  return {
    ...actualFs,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    default: {
      ...actualFs,
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
  }
})

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
            tableName: "data_store_personal_credentials",
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
            tableName: expect.any(String),
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
            tableName: expect.any(String),
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
            tableName: expect.any(String),
            name: "Brain FM accounts",
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
      await modules.dbModule.db.delete(userDataStoresTable)

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

    it("should filter user data stores by name", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?name=personal",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toHaveLength(1)
      expect(payload.data[0].name).toBe("Personal credentials")
    })

    it("should filter user data stores by description", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?description=various",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toHaveLength(1)
      expect(payload.data[0].name).toBe("Personal credentials")
    })

    it("should filter by name and description", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?name=test&description=saving",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toHaveLength(1)
      expect(payload.data[0].name).toBe("Example test of saving page content")
    })

    it("should sort user data stores by name in ascending order", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?sortBy=name&sortOrder=asc",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.map((d: { name: string }) => d.name)).toEqual([
        "Brain FM accounts",
        "Crypto prices",
        "Example test of saving page content",
        "Personal credentials",
      ])
    })

    it("should sort user data stores by name in descending order", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?sortBy=name&sortOrder=desc",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.map((d: { name: string }) => d.name)).toEqual([
        "Personal credentials",
        "Example test of saving page content",
        "Crypto prices",
        "Brain FM accounts",
      ])
    })

    it("should sort user data stores by description in ascending order", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?sortBy=description&sortOrder=asc",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.map((d: { name: string }) => d.name)).toEqual([
        "Crypto prices",
        "Brain FM accounts",
        "Example test of saving page content",
        "Personal credentials",
      ])
    })

    it("should sort user data stores by description in descending order", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?sortBy=description&sortOrder=desc",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.map((d: { name: string }) => d.name)).toEqual([
        "Personal credentials",
        "Example test of saving page content",
        "Crypto prices",
        "Brain FM accounts",
      ])
    })

    it("should filter and sort user data stores", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores?name=crypto&sortBy=name&sortOrder=asc",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data).toHaveLength(1)
      expect(payload.data.map((d: { name: string }) => d.name)).toEqual([
        "Crypto prices",
      ])
    })
  })

  describe("GET /user-data-stores/:tableName", () => {
    it("should return status 200 and the user data store if it exists", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/data_store_personal_credentials",
      })
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: {
          tableName: "data_store_personal_credentials",
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
        url: "/user-data-stores/data_store_personal_credentials/records?sortBy=id&sortOrder=asc",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toMatchObject({
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
      expect(responseData.data.tableName).toMatch(/^data_store_test_store$/)
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
        url: "/user-data-stores/data_store_personal_credentials",
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        tableName: expect.stringMatching(
          /^data_store_updated_personal_credentials$/,
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
        url: "/user-data-stores/data_store_personal_credentials",
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
        url: "/user-data-stores/data_store_personal_credentials",
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
        url: "/user-data-stores/data_store_personal_credentials",
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
        url: "/user-data-stores/data_store_personal_credentials",
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
      expect(getData.data.length).toBe(3)
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
        url: "/user-data-stores/data_store_personal_credentials/records",
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
        url: "/user-data-stores/data_store_personal_credentials/records",
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/data_store_personal_credentials/records",
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

    it("should return status 404 if the record does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/user-data-stores/data_store_personal_credentials/records/999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Record not found",
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
        url: "/user-data-stores/data_store_personal_credentials/records/1",
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
        url: "/user-data-stores/data_store_personal_credentials/records/999",
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
        url: "/user-data-stores/data_store_personal_credentials/records/2",
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/data_store_personal_credentials/records",
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
        url: "/user-data-stores/data_store_personal_credentials/records/999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Record not found",
      })
    })
  })

  describe("POST /user-data-stores/:tableName/import", () => {
    beforeEach(() => {
      vi.mocked(dialog).mockClear()
      vi.mocked(fs.readFileSync).mockClear()
      vi.mocked(fs.writeFileSync).mockClear()
    })

    it("should import data from a CSV file", async () => {
      // Setup: Mock dialog to return a fake file path and fs.readFileSync to return CSV content
      vi.mocked(dialog).mockResolvedValue(["/fake/path/data.csv"])
      const csvContent = `id,origin,username,email,password\n3,https://new.com,new,new@new.com,new_pass123`
      vi.mocked(fs.readFileSync).mockReturnValue(csvContent)

      // Action
      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/data_store_personal_credentials/import",
        payload: { updateRows: false },
      })

      // Assertion
      expect(response.statusCode).toBe(200)

      // Verify data is imported
      const recordsResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/data_store_personal_credentials/records?sortBy=ID&sortOrder=asc",
      })
      const { data } = JSON.parse(recordsResponse.payload)
      expect(data).toHaveLength(3)
      expect(data[2]).toMatchObject({
        id: 3,
        origin: "https://new.com",
        username: "new",
        email: "new@new.com",
        password: "new_pass123",
      })
    })

    it("should import data from a JSON file and update existing rows", async () => {
      // Setup: Mock dialog and fs for JSON import
      vi.mocked(dialog).mockResolvedValue(["/fake/path/data.json"])
      const jsonContent = JSON.stringify({
        rows: [
          {
            id: 1,
            origin: "https://updated.com",
            username: "updated",
            email: "updated@updated.com",
            password: "updated_pass123",
          },
          {
            id: 3,
            origin: "https://new.com",
            username: "new",
            email: "new@new.com",
            password: "new_pass123",
          },
        ],
      })
      vi.mocked(fs.readFileSync).mockReturnValue(jsonContent)

      // Action
      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/data_store_personal_credentials/import",
        payload: { updateRows: true },
      })

      // Assertion
      expect(response.statusCode).toBe(200)

      // Verify data is imported and updated
      const recordsResponse = await modules.api.inject({
        method: "GET",
        url: "/user-data-stores/data_store_personal_credentials/records",
      })
      const { data } = JSON.parse(recordsResponse.payload)
      const sortedData = data.sort(
        (a: { id: number }, b: { id: number }) => a.id - b.id,
      )

      expect(sortedData).toHaveLength(3)
      expect(sortedData[0]).toMatchObject({
        id: 1,
        origin: "https://updated.com",
        username: "updated",
        email: "updated@updated.com",
        password: "updated_pass123",
      })
      expect(sortedData[1].id).toBe(2) // Unchanged
      expect(sortedData[2]).toMatchObject({
        id: 3,
        origin: "https://new.com",
        username: "new",
        email: "new@new.com",
        password: "new_pass123",
      })
    })

    it("should return 404 if data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/non_existent/import",
        payload: { updateRows: false },
      })
      expect(response.statusCode).toBe(404)
    })

    it("should return 400 for invalid file format", async () => {
      vi.mocked(dialog).mockResolvedValue(["/fake/path/data.txt"])
      vi.mocked(fs.readFileSync).mockReturnValue("some content")

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/data_store_personal_credentials/import",
        payload: { updateRows: false },
      })
      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.payload).error).toBe("Invalid file format")
    })

    it("should return 400 for CSV with mismatched columns", async () => {
      vi.mocked(dialog).mockResolvedValue(["/fake/path/data.csv"])
      const csvContent = `id,origin,extra_col\n1,https://a.com,extra`
      vi.mocked(fs.readFileSync).mockReturnValue(csvContent)

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/data_store_personal_credentials/import",
        payload: { updateRows: false },
      })
      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.payload).error).toBe(
        "Number of columns does not match",
      )
    })
  })

  describe("POST /user-data-stores/:tableName/export", () => {
    beforeEach(() => {
      vi.mocked(dialog).mockClear()
      vi.mocked(fs.writeFileSync).mockClear()
    })

    it("should export data to a CSV file", async () => {
      // Setup
      const mockDir = "/fake/dir"
      const mockTableName = "data_store_personal_credentials"
      vi.mocked(dialog).mockResolvedValue([mockDir])
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {})

      // Action
      const response = await modules.api.inject({
        method: "POST",
        url: `/user-data-stores/${mockTableName}/export`,
        payload: { format: "csv" },
      })

      // Assertion
      expect(response.statusCode).toBe(200)
      expect(dialog).toHaveBeenCalledWith({ type: "directory" })
      expect(writeSpy).toHaveBeenCalledTimes(1)
      const writtenContent = writeSpy.mock.calls[0][1] as string
      expect(writtenContent).toContain("id,origin,username,email,password")
      expect(writtenContent).toContain(
        "1,https://example.com/,noop,noop@gmail.com,Noop123!",
      )
    })

    it("should export data to a JSON file with column definitions", async () => {
      // Setup
      const mockDir = "/fake/dir"
      const mockTableName = "data_store_personal_credentials"
      vi.mocked(dialog).mockResolvedValue([mockDir])
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {})

      // Action
      const response = await modules.api.inject({
        method: "POST",
        url: `/user-data-stores/${mockTableName}/export`,
        payload: { format: "json", includeColumnDefinitions: true },
      })

      // Assertion
      expect(response.statusCode).toBe(200)
      const writtenContent = JSON.parse(writeSpy.mock.calls[0][1] as string)
      expect(writtenContent.columnDefinitions).toBeDefined()
      expect(writtenContent.rows).toHaveLength(2)
    })

    it("should return 404 if data store does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/non_existent/export",
        payload: { format: "csv" },
      })
      expect(response.statusCode).toBe(404)
    })

    it("should return 400 if no directory is selected", async () => {
      vi.mocked(dialog).mockResolvedValue([])

      const response = await modules.api.inject({
        method: "POST",
        url: "/user-data-stores/data_store_personal_credentials/export",
        payload: { format: "csv" },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.payload).error).toBe("No directory selected")
    })
  })
})
