import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date) {
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

export function formatDuration(ms: number) {
  const units = [
    { label: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
    { label: "month", ms: 30.44 * 24 * 60 * 60 * 1000 },
    { label: "day", ms: 24 * 60 * 60 * 1000 },
    { label: "hour", ms: 60 * 60 * 1000 },
    { label: "minute", ms: 60 * 1000 },
    { label: "second", ms: 1000 },
    { label: "millisecond", ms: 1 },
  ]

  if (ms < 1000) {
    return `${ms} millisecond${ms !== 1 ? "s" : ""}`
  }

  // Find the largest unit
  let remainder = ms
  let firstIdx = units.findIndex(
    (u) => remainder >= u.ms && u.label !== "millisecond",
  )
  if (firstIdx === -1) firstIdx = units.length - 2 // fallback to seconds
  const firstUnit = units[firstIdx]
  const firstValue = Math.floor(remainder / firstUnit.ms)
  remainder -= firstValue * firstUnit.ms

  // Check if exact unit (no remainder or only milliseconds left)
  const isExact =
    remainder < (firstIdx < units.length - 2 ? units[firstIdx + 1].ms : 1)
  if (isExact) {
    return `${firstValue} ${firstUnit.label}${firstValue !== 1 ? "s" : ""}`
  }

  // Find next unit
  let secondIdx = firstIdx + 1
  while (secondIdx < units.length && units[secondIdx].label === "millisecond") {
    secondIdx++
  }
  if (secondIdx >= units.length) secondIdx = units.length - 2
  const secondUnit = units[secondIdx]
  const secondValue = Math.round(remainder / secondUnit.ms)
  let approx = false

  // If rounding up the second unit bumps the total over the original ms, set approx
  const approxMs = firstValue * firstUnit.ms + secondValue * secondUnit.ms
  if (approxMs !== ms) approx = true

  // If rounding secondValue to 0, just show the first unit
  if (secondValue === 0) {
    return `${firstValue} ${firstUnit.label}${firstValue !== 1 ? "s" : ""}`
  }

  return `${approx ? "≈ " : ""}${firstValue} ${firstUnit.label}${firstValue !== 1 ? "s" : ""} and ${secondValue} ${secondUnit.label}${secondValue !== 1 ? "s" : ""}`
}
