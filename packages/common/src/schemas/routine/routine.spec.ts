import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculateNextScheduledExecutionAt,
  RoutineStatus,
  type Scheduler,
  SchedulerType,
} from "./routine"

describe(calculateNextScheduledExecutionAt.name, () => {
  const anHour = 60 * 60 * 1000
  const aMinute = 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should return null if routine status is not active", () => {
    const now = Date.now()
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: anHour,
      startAt: now,
      endAt: null,
    }
    expect(
      calculateNextScheduledExecutionAt({
        status: RoutineStatus.Paused,
        scheduler,
      }),
    ).toBeNull()
    expect(
      calculateNextScheduledExecutionAt({
        status: RoutineStatus.Executing,
        scheduler,
      }),
    ).toBeNull()
    expect(
      calculateNextScheduledExecutionAt({
        status: RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
        scheduler,
      }),
    ).toBeNull()
  })

  it("should return null if scheduler endAt is in the past", () => {
    const now = Date.now()
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: anHour,
      startAt: now - 2 * anHour,
      endAt: now - aMinute, // in the past
    }
    expect(
      calculateNextScheduledExecutionAt({
        status: RoutineStatus.Active,
        scheduler,
      }),
    ).toBeNull()
  })

  it("should return startAt if it is in the future", () => {
    const now = Date.now()
    const startAt = now + anHour
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: anHour,
      startAt,
      endAt: null,
    }
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(startAt))
  })

  it("should calculate the next execution time if startAt is in the past", () => {
    const now = Date.now()
    const startAt = now - anHour - 15 * aMinute // 1h 15m ago
    const interval = anHour // 1h
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }

    // startAt was at T-1h15m.
    // Executions at: startAt (T-1h15m), startAt+1h (T-15m), startAt+2h (T+45m)
    // now is T. next one should be at T+45m.
    const expected = startAt + 2 * interval
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(expected))
  })

  it("should return null if the next execution time is after endAt", () => {
    const now = Date.now()
    const startAt = now - anHour
    const interval = 45 * aMinute
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: now + 29 * aMinute, // T+29m
    }
    // Next execution would be at T+30m, which is after endAt.
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toBeNull()
  })

  it("should return the execution time if it is exactly endAt", () => {
    const now = Date.now()
    const startAt = now - anHour
    const interval = 45 * aMinute
    const endAt = now + 30 * aMinute // T+30m
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt,
    }
    // Next execution is at T+30m, which is exactly endAt.
    const expected = startAt + 2 * interval
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(expected))
  })

  it("should handle startAt being far in the past", () => {
    const now = Date.now()
    const startAt = now - 100 * anHour
    const interval = anHour
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }
    const intervalsSinceStart = (now - startAt) / interval
    const nextIntervalMultiplier = Math.floor(intervalsSinceStart) + 1
    const expected = startAt + nextIntervalMultiplier * interval
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(expected))
  })

  it("should return null when startAt is in the future but after endAt", () => {
    const now = Date.now()
    const startAt = now + anHour
    const endAt = now + 30 * aMinute
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: anHour,
      startAt,
      endAt,
    }
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toBeNull()
  })

  it("should return startAt when it is in the future and before endAt", () => {
    const now = Date.now()
    const startAt = now + 30 * aMinute
    const endAt = now + anHour
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval: anHour,
      startAt,
      endAt,
    }
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(startAt))
  })

  it("should correctly calculate next execution when now is exactly on a scheduled time", () => {
    const now = Date.now()
    const interval = anHour
    const startAt = now - interval // Last execution was exactly now
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }

    // The logic is `(now - startAt) / interval` which is `interval / interval` = 1.
    // floor(1) + 1 = 2.
    // next is startAt + 2 * interval = now - interval + 2 * interval = now + interval.
    // This is correct. It should schedule for the *next* interval, not the current one.
    const expected = startAt + 2 * interval
    const result = calculateNextScheduledExecutionAt({
      status: RoutineStatus.Active,
      scheduler,
    })
    expect(result).toEqual(new Date(expected))
  })
})
