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
  const MINUTE_MS = 60 * 1000
  const HOUR_MS = 60 * MINUTE_MS
  const DAY_MS = 24 * HOUR_MS
  const MONTH_MS = 30.44 * DAY_MS
  const YEAR_MS = 365.25 * DAY_MS

  it("returns milliseconds for values < 1000", () => {
    expect(formatDuration(456)).toBe("456 milliseconds")
    expect(formatDuration(1)).toBe("1 millisecond")
    expect(formatDuration(0)).toBe("0 milliseconds")
    expect(formatDuration(-1337)).toBe("0 milliseconds")
  })
  it("returns single unit for exact values", () => {
    expect(formatDuration(1000)).toBe("1 second")
    expect(formatDuration(MINUTE_MS)).toBe("1 minute")
    expect(formatDuration(2 * HOUR_MS)).toBe("2 hours")
  })
  it("returns two units for non-exact values", () => {
    expect(formatDuration(5 * DAY_MS + 4 * HOUR_MS + 13)).toBe(
      "≈ 5 days and 4 hours",
    )

    expect(formatDuration(13 * MINUTE_MS + 3 * 1000 - 13)).toBe(
      "≈ 13 minutes and 3 seconds",
    )

    expect(formatDuration(YEAR_MS + 2 * MONTH_MS + 49)).toBe(
      "≈ 1 year and 2 months",
    )

    expect(formatDuration(12_500)).toBe("12 seconds and 500 milliseconds")
  })
  it("handles pluralization", () => {
    expect(formatDuration(2 * 1000)).toBe("2 seconds")
    expect(formatDuration(2 * MINUTE_MS)).toBe("2 minutes")
  })
  it("returns only the largest unit if the remainder rounds to zero", () => {
    expect(formatDuration(24 * HOUR_MS)).toBe("1 day")
  })

  // New tests for minimalUnit argument
  it("respects minimalUnit argument", () => {
    expect(formatDuration(30 * HOUR_MS, "hour")).toBe("1 day and 6 hours")
    expect(formatDuration(90 * 1000, "minute")).toBe("1.5 minutes")
    expect(formatDuration(500, "second")).toBe("0.5 seconds")
    expect(formatDuration(1, "second")).toBe("0 seconds")
    expect(formatDuration(2 * HOUR_MS + 30 * MINUTE_MS, "hour")).toBe(
      "2.5 hours",
    )
    expect(formatDuration(2 * HOUR_MS + 30 * MINUTE_MS, "minute")).toBe(
      "2 hours and 30 minutes",
    )
    // Additional edge cases
    expect(formatDuration(0, "hour")).toBe("0 hours")
    expect(formatDuration(0, "millisecond")).toBe("0 milliseconds")
    expect(formatDuration(59 * 1000, "minute")).toBe("≈ 0.98 minutes")
    expect(formatDuration(2 * HOUR_MS + 1, "hour")).toBe("≈ 2 hours")
    expect(formatDuration(2 * HOUR_MS + 1, "minute")).toBe("≈ 2 hours")
    expect(formatDuration(1000, "second")).toBe("1 second")
    expect(formatDuration(1001, "second")).toBe("≈ 1 second")
    expect(formatDuration(1500, "second")).toBe("1.5 seconds")
    expect(formatDuration(1500, "minute")).toBe("≈ 0.03 minutes")
  })
  it("throws on unknown minimalUnit", () => {
    // @ts-expect-error Testing unknown minimalUnit
    expect(() => formatDuration(1000, "foo")).toThrow()
  })
})
