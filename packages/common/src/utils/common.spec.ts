import { describe, it, expect } from "vitest"
import { deepMerge } from "./common"

describe(deepMerge.name, () => {
  it("should merge non-nested objects", () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it("should merge nested objects", () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 } }
    const result = deepMerge(target, source as never)
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } })
  })

  it("should handle arrays by concatenating them", () => {
    const target = { a: [1, 2] }
    const source = { a: [3, 4] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [1, 2, 3, 4] })
  })

  it("should replace non-object with object", () => {
    const target = { a: 1 }
    const source = { a: { b: 2 } }
    const result = deepMerge(target, source as never)
    expect(result).toEqual({ a: { b: 2 } })
  })

  it("should replace array with non-array", () => {
    const target = { a: [1, 2] }
    const source = { a: "hello" }
    const result = deepMerge(target, source as never)
    expect(result).toEqual({ a: "hello" })
  })

  it("should replace array with object", () => {
    const target = { a: [1, 2] }
    const source = { a: { b: 1 } }
    const result = deepMerge(target, source as never)
    expect(result).toEqual({ a: { b: 1 } })
  })

  it("should replace non-array with an array", () => {
    const target = { a: 1 }
    const source = { a: [1, 2] }
    const result = deepMerge(target, source as never)
    expect(result).toEqual({ a: [1, 2] })
  })

  it("should return target if source is not an object", () => {
    const target = { a: 1 }
    const source = null
    const merged = deepMerge(target, source as never)
    expect(merged).toEqual(target)
  })
})
