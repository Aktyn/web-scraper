import { describe, it, expect } from "vitest"
import {
  executionRangeSchema,
  executionIteratorSchema,
  ExecutionIteratorType,
} from "./iterator"

describe("executionRangeSchema", () => {
  it("should pass with valid range", () => {
    const data = { start: 1, end: 5 }
    const result = executionRangeSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should pass with valid range and step", () => {
    const data = { start: 1, end: 5, step: 2 }
    const result = executionRangeSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should fail if start is greater than end", () => {
    const data = { start: 5, end: 1 }
    const result = executionRangeSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe("executionIteratorSchema", () => {
  it("should pass for range iterator with range object", () => {
    const data = {
      type: ExecutionIteratorType.Range,
      dataSourceName: "test",
      range: { start: 1, end: 5 },
    }
    const result = executionIteratorSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should pass for range iterator with number", () => {
    const data = {
      type: ExecutionIteratorType.Range,
      dataSourceName: "test",
      range: 5,
    }
    const result = executionIteratorSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should pass for entire set iterator", () => {
    const data = {
      type: ExecutionIteratorType.EntireSet,
      dataSourceName: "test",
    }
    const result = executionIteratorSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should pass for filtered set iterator", () => {
    const data = {
      type: ExecutionIteratorType.FilteredSet,
      dataSourceName: "test",
      where: {
        and: [
          {
            column: "name",
            condition: "equals",
            value: "test",
          },
        ],
      },
    }
    const result = executionIteratorSchema.safeParse(data)
    if (!result.success) {
      console.error(result.error.errors)
    }
    expect(result.success).toBe(true)
  })
})
