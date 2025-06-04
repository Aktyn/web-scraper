import { cn, formatDateTime, formatDuration } from "./utils"
import { describe, it, expect } from "vitest"

describe("cn", () => {
  it("merges class names and removes duplicates", () => {
    expect(cn("text-foreground", "bar", "text-foreground")).toBe(
      "bar text-foreground",
    )
  })
  it("handles conditional classes", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })
  it("returns empty string for no input", () => {
    expect(cn()).toBe("")
  })
})

describe("formatDateTime", () => {
  it("formats a date to MM/DD/YYYY, HH:MM:SS", () => {
    const date = new Date("2023-12-31T23:59:59")
    expect(formatDateTime(date)).toMatch(
      /\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}:\d{2}/,
    )
  })
})

describe("formatDuration", () => {
  it("returns milliseconds for values < 1000", () => {
    expect(formatDuration(456)).toBe("456 milliseconds")
    expect(formatDuration(1)).toBe("1 millisecond")
  })
  it("returns single unit for exact values", () => {
    expect(formatDuration(1000)).toBe("1 second")
    expect(formatDuration(60 * 1000)).toBe("1 minute")
    expect(formatDuration(2 * 60 * 60 * 1000)).toBe("2 hours")
  })
  it("returns two units for non-exact values", () => {
    expect(
      formatDuration(5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 13),
    ).toBe("≈ 5 days and 4 hours")
    expect(formatDuration(13 * 60 * 1000 + 3 * 1000 - 13)).toBe(
      "≈ 13 minutes and 3 seconds",
    )
    expect(
      formatDuration(
        1 * 365.25 * 24 * 60 * 60 * 1000 + 2 * 30.44 * 24 * 60 * 60 * 1000,
      ),
    ).toMatch(/1 year and 2 months|1 year and 2 month/) // allow pluralization
  })
  it("handles pluralization", () => {
    expect(formatDuration(2 * 1000)).toBe("2 seconds")
    expect(formatDuration(2 * 60 * 1000)).toBe("2 minutes")
  })
  it("returns only the largest unit if the remainder rounds to zero", () => {
    expect(formatDuration(24 * 60 * 60 * 1000)).toBe("1 day")
  })
})
