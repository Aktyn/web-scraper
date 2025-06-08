import { describe, it, expect } from "vitest"
import { z } from "zod"
import {
  getApiResponseSchema,
  getApiPaginatedResponseSchema,
  apiPaginationQuerySchema,
  apiErrorResponseSchema,
} from "./api"

describe("api schemas", () => {
  describe(getApiResponseSchema.name, () => {
    it("should create a schema that validates a correct api response", () => {
      const schema = getApiResponseSchema(z.object({ name: z.string() }))
      const response = { data: { name: "test" } }
      const result = schema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe(getApiPaginatedResponseSchema.name, () => {
    it("should create a schema that validates a correct paginated api response", () => {
      const schema = getApiPaginatedResponseSchema(
        z.object({ name: z.string() }),
      )
      const response = {
        data: [{ name: "test" }],
        page: 1,
        pageSize: 10,
        hasMore: false,
      }
      const result = schema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe("apiPaginationQuerySchema", () => {
    it("should validate a correct pagination query", () => {
      const query = { page: 1, pageSize: 10 }
      const result = apiPaginationQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
    })

    it("should use default values for missing fields", () => {
      const query = {}
      const result = apiPaginationQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(0)
        expect(result.data.pageSize).toBe(64)
      }
    })
  })

  describe("apiErrorResponseSchema", () => {
    it("should validate a correct error response", () => {
      const error = {
        statusCode: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
      }
      const result = apiErrorResponseSchema.safeParse(error)
      expect(result.success).toBe(true)
    })
  })
})
