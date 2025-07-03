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
      calculateNextScheduledExecutionAt(
        {
          status: RoutineStatus.Paused,
          scheduler,
        },
        null,
      ),
    ).toBeNull()
    expect(
      calculateNextScheduledExecutionAt(
        {
          status: RoutineStatus.Executing,
          scheduler,
        },
        null,
      ),
    ).toBeNull()
    expect(
      calculateNextScheduledExecutionAt(
        {
          status: RoutineStatus.PausedDueToMaxNumberOfFailedExecutions,
          scheduler,
        },
        null,
      ),
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
      calculateNextScheduledExecutionAt(
        {
          status: RoutineStatus.Active,
          scheduler,
        },
        null,
      ),
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
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      null,
    )
    expect(result).toEqual(new Date(startAt))
  })

  it("should return null if the next execution time is after endAt", () => {
    const now = Date.now()
    const startAt = now - anHour
    const interval = 45 * aMinute
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: now - 29 * aMinute, // T-29m
    }
    // Next execution would be at T+30m, which is after endAt.
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      null,
    )
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
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      new Date(now),
    )
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
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      null,
    )
    expect(result).toEqual(new Date(startAt))
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
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      null,
    )
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
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      null,
    )
    expect(result).toEqual(new Date(startAt))
  })

  it("should calculate next execution correctly when lastExecutionAt is in the past", () => {
    const now = Date.now()
    const startAt = now - 2 * anHour
    const interval = anHour
    const lastExecutionAt = new Date(now - anHour) // Last execution was 1 hour ago
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }

    const expected = startAt + 2 * interval // Should be at `now`
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      lastExecutionAt,
    )
    expect(result).toEqual(new Date(expected))
  })

  it("should calculate next execution correctly when lastExecutionAt is in the future", () => {
    const now = Date.now()
    const startAt = now - anHour
    const interval = anHour
    const lastExecutionAt = new Date(now + 30 * aMinute) // "Last execution" is in 30 minutes
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }

    // Reference time will be lastExecutionAt (T+30m)
    // startAt = T-1h, interval = 1h
    // intervals since start = (T+30m - (T-1h)) / 1h = 1.5h / 1h = 1.5
    // next multiplier = floor(1.5)+1 = 2
    // next execution = startAt + 2 * interval = T-1h + 2h = T+1h
    const expected = startAt + 2 * interval
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      lastExecutionAt,
    )
    expect(result).toEqual(new Date(expected))
  })

  it("should advance to the next interval if next scheduled time is before lastExecutionAt", () => {
    const now = Date.now()
    const startAt = now - 2 * anHour
    const interval = anHour
    // Next execution based on now would be at startAt + 2*interval = now.
    // But last execution was later than that.
    const lastExecutionAt = new Date(now + 10 * aMinute)
    const scheduler: Scheduler = {
      type: SchedulerType.Interval,
      interval,
      startAt,
      endAt: null,
    }

    // Reference time will be lastExecutionAt (T+10m)
    // startAt = T-2h, interval = 1h
    // intervals since start = (T+10m - (T-2h)) / 1h = 2h10m / 1h ~= 2.16
    // next multiplier = floor(2.16)+1 = 3
    // next execution = startAt + 3 * interval = T-2h + 3h = T+1h
    const expected = startAt + 3 * interval
    const result = calculateNextScheduledExecutionAt(
      {
        status: RoutineStatus.Active,
        scheduler,
      },
      lastExecutionAt,
    )
    expect(result).toEqual(new Date(expected))
  })
})
