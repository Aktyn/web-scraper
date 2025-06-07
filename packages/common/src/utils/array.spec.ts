import { describe, expect, it } from "vitest"
import { unique, uniqueBy } from "./array"

describe(unique.name, () => {
  it("should return an array with unique values", () => {
    const array = [1, 2, 2, 3, 4, 4, 5]
    const result = unique(array)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it("should return the same array if all values are unique", () => {
    const array = [1, 2, 3, 4, 5]
    const result = unique(array)
    expect(result).toEqual(array)
  })

  it("should handle an empty array", () => {
    const array: number[] = []
    const result = unique(array)
    expect(result).toEqual([])
  })

  it("should work with strings", () => {
    const array = ["a", "b", "a", "c", "b"]
    const result = unique(array)
    expect(result).toEqual(["a", "b", "c"])
  })
})

describe(uniqueBy.name, () => {
  it("should return an array with unique values based on the key, keeping the last-seen item", () => {
    const array = [
      { id: "1", value: "a" },
      { id: "2", value: "b" },
      { id: "1", value: "c" },
    ]
    const result = uniqueBy(array, (item) => item.id)
    expect(result).toEqual([
      { id: "1", value: "c" },
      { id: "2", value: "b" },
    ])
  })

  it("should return the same array if all values are unique by key", () => {
    const array = [
      { id: "1", value: "a" },
      { id: "2", value: "b" },
      { id: "3", value: "c" },
    ]
    const result = uniqueBy(array, (item) => item.id)
    expect(result).toEqual(array)
  })

  it("should handle an empty array", () => {
    const array: { id: string }[] = []
    const result = uniqueBy(array, (item) => item.id)
    expect(result).toEqual([])
  })
})
