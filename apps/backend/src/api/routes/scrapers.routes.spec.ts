import {
  PageActionType,
  runUnsafeAsync,
  type ScraperInstructions,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperState,
  type SimpleLogger,
  type UpsertScraper,
  wait,
} from "@web-scraper/common"
import {
  type DataBridge,
  Scraper,
  ScraperExecutionInfo,
} from "@web-scraper/core"
import { count } from "drizzle-orm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  scraperDataSourcesTable,
  scrapersTable,
  userDataStoresTable,
} from "../../db/schema"
import { setup, type TestModules } from "../../test/setup"

vi.mock("@web-scraper/core", async (importActual) => {
  const voidLogger = Object.entries(console).reduce(
    (acc, [key, value]) => {
      if (typeof value === "function") {
        acc[key as keyof SimpleLogger] = () => {}
      } else {
        acc[key as keyof SimpleLogger] = value as never
      }
      return acc
    },
    {
      fatal: console.error,
    } as SimpleLogger,
  )

  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await importActual()) as typeof import("@web-scraper/core")
  return {
    ...actual,
    Scraper: class MockScraper extends actual.Scraper {
      public static forceCleanUp() {
        this.instances.clear()
      }

      constructor(options: object) {
        super({
          id: 1,
          name: "test",
          ...options,
          logger: voidLogger,
          noInit: true,
        })
      }

      override async execute(
        instructions: ScraperInstructions,
        dataBridge: DataBridge,
      ) {
        await wait(1_000)
        const executionInfo = new ScraperExecutionInfo(instructions, dataBridge)
        executionInfo.push({
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            pageIndex: 0,
            pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
            action: {
              type: PageActionType.Navigate,
              url: "http://127.0.0.1:1337/api",
            },
            type: ScraperInstructionType.PageAction,
          },
          duration: 3000,
        })
        executionInfo.push({
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: 4000,
          },
        })
        return executionInfo
      }

      get currentlyExecutingInstruction() {
        return null
      }
    },
  }
})

describe("Scrapers Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    modules = await setup()
    //@ts-expect-error - mocked method
    Scraper.forceCleanUp()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.clearAllMocks()

    const scraperInstances = Scraper.getInstances()
    for (const scraperInstance of scraperInstances) {
      await runUnsafeAsync(
        () => scraperInstance.destroy(),
        () => void 0,
      )
    }
    await wait(32)
  })

  describe("POST /scrapers/:id/terminate", () => {
    it("should terminate a running scraper and return 200", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperToExecute = listData.data[0]

      expect(Scraper.getInstances().length).toBe(0)

      const executeResponse = await modules.api.inject({
        method: "POST",
        url: `/scrapers/${scraperToExecute.id}/execute`,
        body: {
          iterator: null,
        },
      })

      expect(executeResponse.statusCode).toBe(200)
      expect(Scraper.getInstances().length).toBe(1)

      const terminateResponse = await modules.api.inject({
        method: "POST",
        url: `/scrapers/${scraperToExecute.id}/terminate`,
      })

      expect(terminateResponse.statusCode).toBe(200)
      expect(JSON.parse(terminateResponse.payload)).toEqual({ data: null })
      expect(Scraper.getInstances().length).toBe(0)
    })

    it("should return 404 if scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers/9999/terminate",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })

    it("should return 400 if scraper is not running", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      // Ensure scraper is not running
      await Promise.all(
        Scraper.getInstances().map((scraper) => {
          return runUnsafeAsync(
            () => scraper.destroy(),
            () => void 0,
          )
        }),
      )
      await wait(100)

      const response = await modules.api.inject({
        method: "POST",
        url: `/scrapers/${scraperId}/terminate`,
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper is not running",
      })
    })
  })

  describe("GET /scrapers", () => {
    it("should return status 200 and scrapers from the database", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers?page=0&pageSize=1",
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data.data.length).toBe(1)
      expect(data).toEqual({
        data: [
          {
            id: expect.any(Number),
            name: expect.any(String),
            description: expect.toBeOneOf([null, expect.any(String)]),
            instructions: expect.any(Array),
            userDataDirectory: expect.toBeOneOf([null, expect.any(String)]),
            dataSources: expect.any(Array),
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
          },
        ],
        page: 0,
        pageSize: 1,
        hasMore: true,
      })
    })

    it("should return status 200 and an empty array if no scrapers exist", async () => {
      let junctions = await modules.db
        .select({ count: count() })
        .from(scraperDataSourcesTable)
        .get()
      let stores = await modules.db
        .select({ count: count() })
        .from(userDataStoresTable)
        .get()
      const storesCount = stores?.count ?? 0

      expect(junctions?.count).toBeGreaterThan(0)
      expect(storesCount).toBeGreaterThan(0)

      await modules.db.delete(scrapersTable)

      junctions = await modules.db
        .select({ count: count() })
        .from(scraperDataSourcesTable)
        .get()
      stores = await modules.db
        .select({ count: count() })
        .from(userDataStoresTable)
        .get()
      expect(junctions?.count).toBe(0)
      expect(stores?.count).toBe(storesCount)

      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: [],
        page: 0,
        pageSize: 64,
        hasMore: false,
      })
    })

    it("should filter scrapers by name", async () => {
      const name = "New pepper alerts"
      const response = await modules.api.inject({
        method: "GET",
        url: `/scrapers?name=${encodeURIComponent(name.toLowerCase())}`,
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data.data.length).toBe(1)
      expect(data.data[0].name).toBe(name)
      expect(data.hasMore).toBe(false)

      const nonExistentResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers?name=non-existent-scraper",
      })

      expect(nonExistentResponse.statusCode).toBe(200)
      const nonExistentData = JSON.parse(nonExistentResponse.payload)
      expect(nonExistentData.data.length).toBe(0)
      expect(nonExistentData.hasMore).toBe(false)
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "select").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe("GET /scrapers/currently-executing", () => {
    it("should return status 200 and an empty list if no scrapers are running", async () => {
      const { Scraper } = await import("@web-scraper/core")
      vi.spyOn(Scraper, "getInstances").mockReturnValue([])

      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/currently-executing?page=0&pageSize=10",
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.data).toEqual([])
      expect(body.hasMore).toBe(false)
      expect(body.page).toBe(0)
      expect(body.pageSize).toBe(10)
    })

    it("should return status 200 and a list of currently executing scrapers", async () => {
      const { Scraper } = await import("@web-scraper/core")
      const mockScraperInstances = [
        new Scraper({ id: 1, name: "Test Scraper 1" }),
        new Scraper({ id: 2, name: "Test Scraper 2" }),
      ]
      vi.spyOn(Scraper, "getInstances").mockReturnValue(mockScraperInstances)

      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/currently-executing?page=0&pageSize=10",
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.data).toEqual([
        { id: 1, name: "Test Scraper 1" },
        { id: 2, name: "Test Scraper 2" },
      ])
      expect(body.hasMore).toBe(false)
      expect(body.page).toBe(0)
      expect(body.pageSize).toBe(10)
    })

    it("should handle pagination correctly", async () => {
      const { Scraper } = await import("@web-scraper/core")
      const mockScraperInstances = [
        new Scraper({ id: 1, name: "Scraper 1" }),
        new Scraper({ id: 2, name: "Scraper 2" }),
        new Scraper({ id: 3, name: "Scraper 3" }),
      ]
      vi.spyOn(Scraper, "getInstances").mockReturnValue(mockScraperInstances)

      const responsePage1 = await modules.api.inject({
        method: "GET",
        url: "/scrapers/currently-executing?page=0&pageSize=2",
      })

      expect(responsePage1.statusCode).toBe(200)
      const bodyPage1 = JSON.parse(responsePage1.payload)
      expect(bodyPage1.data).toEqual([
        { id: 1, name: "Scraper 1" },
        { id: 2, name: "Scraper 2" },
      ])
      expect(bodyPage1.hasMore).toBe(true)
      expect(bodyPage1.page).toBe(0)
      expect(bodyPage1.pageSize).toBe(2)

      const responsePage2 = await modules.api.inject({
        method: "GET",
        url: "/scrapers/currently-executing?page=1&pageSize=2",
      })
      const bodyPage2 = JSON.parse(responsePage2.payload)
      expect(responsePage2.statusCode).toBe(200)
      expect(bodyPage2.data).toEqual([{ id: 3, name: "Scraper 3" }])
      expect(bodyPage2.hasMore).toBe(false)
      expect(bodyPage2.page).toBe(1)
      expect(bodyPage2.pageSize).toBe(2)
    })
  })

  describe("GET /scrapers/:id", () => {
    it("should return status 200 and scraper data from the database", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const response = await modules.api.inject({
        method: "GET",
        url: `/scrapers/${scraperId}`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: {
          id: scraperId,
          name: expect.any(String),
          description: expect.toBeOneOf([null, expect.any(String)]),
          instructions: expect.any(Array),
          userDataDirectory: expect.toBeOneOf([null, expect.any(String)]),
          dataSources: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        },
      })
    })

    it("should return status 404 if scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })
  })

  describe("POST /scrapers", () => {
    it("should create a new scraper and return status 201", async () => {
      const newScraper: UpsertScraper = {
        name: "Test Scraper",
        description: "A test scraper",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        userDataDirectory: "/test/directory",
        dataSources: [
          {
            dataStoreTableName: "data_store_personal_credentials",
            sourceAlias: "foo",
            whereSchema: null,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers",
        payload: newScraper,
      })

      expect(response.statusCode).toBe(201)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        id: expect.any(Number),
        name: "Test Scraper",
        description: "A test scraper",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        userDataDirectory: "/test/directory",
      })
    })

    it("should create a new scraper without optional fields", async () => {
      const newScraper: UpsertScraper = {
        name: "Minimal Test Scraper",
        description: null,
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        dataSources: [],
        userDataDirectory: null,
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers",
        payload: newScraper,
      })

      expect(response.statusCode).toBe(201)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data.description).toBeNull()
      expect(responseData.data.userDataDirectory).toBeNull()
    })

    it("should return status 409 if a scraper with the same name already exists", async () => {
      const newScraper: UpsertScraper = {
        name: "New pepper alerts",
        description: "Duplicate name",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        dataSources: [],
        userDataDirectory: null,
      }

      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers",
        payload: newScraper,
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.payload)).toEqual({
        error: "A scraper with this name already exists",
      })
    })

    it("should return status 400 for invalid input", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers",
        payload: {
          name: "",
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe("PUT /scrapers/:id", () => {
    it("should update an existing scraper and return status 200", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const updateData: UpsertScraper = {
        name: "Updated Pepper Alerts",
        description: "Updated description",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://updated.com",
            },
          },
        ],
        userDataDirectory: "/updated/directory",
        dataSources: [
          {
            dataStoreTableName: "data_store_personal_credentials",
            sourceAlias: "foo",
            whereSchema: null,
          },
        ],
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: `/scrapers/${scraperId}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data).toMatchObject({
        id: scraperId,
        name: "Updated Pepper Alerts",
        description: "Updated description",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://updated.com",
            },
          },
        ],
        userDataDirectory: "/updated/directory",
        dataSources: [
          {
            dataStoreTableName: "data_store_personal_credentials",
            sourceAlias: "foo",
            whereSchema: null,
          },
        ],
      })
    })

    it("should return empty description and userDataDirectory if not provided", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const updateData: UpsertScraper = {
        name: "Only Name Updated",
        description: null,
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        dataSources: [],
        userDataDirectory: null,
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: `/scrapers/${scraperId}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseData = JSON.parse(response.payload)
      expect(responseData.data.name).toBe("Only Name Updated")
      expect(responseData.data.description).toBe(null)
      expect(responseData.data.userDataDirectory).toBe(null)
    })

    it("should return status 404 if the scraper does not exist", async () => {
      const updateData: UpsertScraper = {
        name: "Non-existent Scraper",
        description: null,
        dataSources: [],
        userDataDirectory: null,
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: "/scrapers/999",
        payload: updateData,
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })

    it("should return status 409 if updating to a name that already exists", async () => {
      await modules.api.inject({
        method: "POST",
        url: "/scrapers",
        payload: {
          name: "Another Scraper",
          description: "Another test scraper",
          instructions: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Navigate,
                url: "https://example.com",
              },
            },
          ],
          dataSources: [],
          userDataDirectory: null,
        } satisfies UpsertScraper,
      })

      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const originalScraperId = listData.data[1].id

      const updateData: UpsertScraper = {
        name: "Another Scraper",
        description: "Another test scraper",
        instructions: [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: "https://example.com",
            },
          },
        ],
        dataSources: [],
        userDataDirectory: null,
      }

      const response = await modules.api.inject({
        method: "PUT",
        url: `/scrapers/${originalScraperId}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.payload)).toEqual({
        error: "A scraper with this name already exists",
      })
    })

    it("should return status 400 for invalid input", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const response = await modules.api.inject({
        method: "PUT",
        url: `/scrapers/${scraperId}`,
        payload: {
          name: "",
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe("DELETE /scrapers/:id", () => {
    it("should delete an existing scraper and return status 204", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const response = await modules.api.inject({
        method: "DELETE",
        url: `/scrapers/${scraperId}`,
      })

      expect(response.statusCode).toBe(204)
      expect(response.payload).toBe("")

      const getResponse = await modules.api.inject({
        method: "GET",
        url: `/scrapers/${scraperId}`,
      })

      expect(getResponse.statusCode).toBe(404)
    })

    it("should return status 404 if the scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/scrapers/999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })
  })

  describe("POST /scrapers/:id/execute", () => {
    afterEach(async () => {
      await Promise.all(
        Scraper.getInstances().map((scraper) => {
          return runUnsafeAsync(
            () => scraper.destroy(),
            () => void 0,
          )
        }),
      )
      await wait(100)
    })

    it("should execute the scraper and return status 200 with empty object", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const response = await modules.api.inject({
        method: "POST",
        url: `/scrapers/${scraperId}/execute`,
        body: {
          iterator: {
            dataSourceName: "products",
            type: "entire-set",
          },
        },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({ data: null })
    })

    it("should return status 404 if the scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers/99999/execute",
        body: {
          iterator: {
            dataSourceName: "products",
            type: "entire-set",
          },
        },
      })
      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })

    it("should return status 400 for invalid id param", async () => {
      const response = await modules.api.inject({
        method: "POST",
        url: "/scrapers/invalid/execute",
      })
      expect(response.statusCode).toBe(400)
    })
  })

  describe("GET /scrapers/:id/execution-status", () => {
    it("should execute the scraper and return status 200 with execution status object", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraper1Id = listData.data[3].id

      await Promise.all(
        Scraper.getInstances().map((scraper) => {
          return runUnsafeAsync(
            () => scraper.destroy(),
            () => void 0,
          )
        }),
      )
      await wait(100)

      const executeResponse = await modules.api.inject({
        method: "POST",
        url: `/scrapers/${scraper1Id}/execute`,
        body: {
          iterator: null,
        },
      })
      expect(executeResponse.statusCode).toBe(200)

      const response = await modules.api.inject({
        method: "GET",
        url: `/scrapers/${scraper1Id}/execution-status`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: {
          state: ScraperState.Pending,
          executionInfo: [],
          currentlyExecutingInstruction: null,
        },
      })
    })

    it("should return null if the scraper is not executing", async () => {
      await Promise.all(
        Scraper.getInstances().map((scraper) => {
          return runUnsafeAsync(
            () => scraper.destroy(),
            () => void 0,
          )
        }),
      )
      await wait(100)

      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraper2Id = listData.data[4].id

      const response = await modules.api.inject({
        method: "GET",
        url: `/scrapers/${scraper2Id}/execution-status`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: null,
      })
    })

    it("should return status 404 if the scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/99999/execution-status",
      })
      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })

    it("should return status 400 for invalid id param", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/invalid/execution-status",
      })
      expect(response.statusCode).toBe(400)
    })
  })

  describe("GET /scrapers/executions", () => {
    it("should return status 200 and paginated execution infos", async () => {
      const listResponse = await modules.api.inject({
        method: "GET",
        url: "/scrapers",
      })
      const listData = JSON.parse(listResponse.payload)
      const scraperId = listData.data[0].id

      const response = await modules.api.inject({
        method: "GET",
        url: `/scrapers/executions?page=0&pageSize=2&id=${scraperId}`,
      })

      const data = JSON.parse(response.payload)
      expect(data.data.length).toBe(2)
      expect(data.hasMore).toBe(true)
      expect(data.page).toBe(0)
      expect(data.pageSize).toBe(2)

      expect(data.data[0]).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Number),
        scraperId: listData.data[0].id,
        iterator: expect.any(Object),
        iterations: expect.any(Array),
      })
    })

    it("should return status 200 and paginated execution infos for all scrapers if no id is provided", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/executions?page=0&pageSize=5",
      })

      const data = JSON.parse(response.payload)
      expect(data.data.length).toBe(5)
      expect(data.hasMore).toBe(true)
      expect(data.page).toBe(0)
      expect(data.pageSize).toBe(5)
    })

    it("should return status 404 if scraper does not exist", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/scrapers/executions?id=999",
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.payload)).toEqual({
        error: "Scraper not found",
      })
    })
  })
})
