import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date | number) {
  if (typeof date === "number") {
    date = new Date(date)
  }

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  })
}

export const timeUnits = {
  millisecond: 1,
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  month: 30.44 * 24 * 60 * 60 * 1000,
  year: 365.25 * 24 * 60 * 60 * 1000,
} as const

const units = Object.entries(timeUnits).map(([label, ms]) => ({
  label,
  ms,
})) as {
  label: keyof typeof timeUnits
  ms: number
}[]

export function formatDuration(
  ms: number,
  minimalUnit: (typeof units)[number]["label"] = "millisecond",
  separator = " and ",
) {
  if (ms < 1000) {
    const unit = units.find((u) => u.label === minimalUnit)
    return pluralize(Math.max(0, ms) / (unit?.ms ?? 1), minimalUnit)
  }

  const minimalUnitIndex = units.findIndex((u) => u.label === minimalUnit)
  if (minimalUnitIndex === -1) {
    throw new Error(`Invalid minimal unit: ${minimalUnit}`)
  }
  let unitIndex = units.findIndex(
    (_, index) =>
      index >= minimalUnitIndex &&
      index < units.length - 1 &&
      ms < units[index + 1].ms,
  )
  if (unitIndex === -1) {
    unitIndex = units.length - 1
  }

  const unit = units[unitIndex]

  if (minimalUnit !== "millisecond" && unitIndex - 1 < minimalUnitIndex) {
    const value = ms / unit.ms
    const precise = (Math.round(ms * 100) % unit.ms) * 100 === 0
    if (precise) {
      return pluralize(value, unit.label)
    } else {
      return `≈ ${pluralize(value, unit.label)}`
    }
  }

  const previousUnit = units[unitIndex - 1] ?? null

  const unitAmount = Math.floor(ms / unit.ms)
  const remainder = ms % unit.ms
  let precise = previousUnit ? remainder % previousUnit.ms === 0 : true

  const parts = unitAmount > 0 ? [pluralize(unitAmount, unit.label)] : []
  if (previousUnit && remainder > 0) {
    const previousUnitAmount = Math.round(remainder / previousUnit.ms)
    if (previousUnitAmount > 0 || !parts.length) {
      const part = pluralize(previousUnitAmount, previousUnit.label)
      parts.push(part)
    } else {
      precise = false
    }
  }
  return precise ? parts.join(separator) : `≈ ${parts.join(separator)}`
}

function pluralize(value: number, label: string) {
  const rounded = Math.round(value * 100) / 100
  return `${rounded} ${label}${rounded !== 1 ? "s" : ""}`
}
