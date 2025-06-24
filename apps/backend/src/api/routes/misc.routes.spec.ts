import { beforeEach, describe, expect, it } from "vitest"
import { preferencesTable } from "../../db/schema"
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
        data: [
          { key: "headless", value: true },
          {
            key: "chromeExecutablePath",
            value: "",
          },
          {
            key: "proxyURL",
            value: "",
          },
          {
            key: "portalURL",
            value: "http://localhost:3000",
          },
          {
            key: "viewportWidth",
            value: 1920,
          },
          {
            key: "viewportHeight",
            value: 1080,
          },
        ],
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
  })

  describe("PUT /preferences/:key", () => {
    it("should return 200 and the updated preference", async () => {
      const response = await modules.api.inject({
        method: "PUT",
        url: "/preferences/headless",
        payload: {
          value: false,
        },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({
        data: { key: "headless", value: false },
      })
    })

    it("should return 400 if given key is not a valid preference key", async () => {
      const response = await modules.api.inject({
        method: "PUT",
        url: "/preferences/non-existent-key",
        payload: {
          value: "some-value",
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it("should return 400 if the payload is invalid", async () => {
      const response = await modules.api.inject({
        method: "PUT",
        url: "/preferences/headless",
        payload: null as never,
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
