// Note .reverse() after this array
const timeUnits = [
  {
    singular: 'millisecond' as const,
    plural: 'milliseconds' as const,
    scale: 1,
  },
  {
    singular: 'second' as const,
    plural: 'seconds' as const,
    scale: 1000,
  },
  {
    singular: 'minute' as const,
    plural: 'minutes' as const,
    scale: 1000 * 60,
  },
  {
    singular: 'hour' as const,
    plural: 'hours' as const,
    scale: 1000 * 60 * 60,
  },
  {
    singular: 'day' as const,
    plural: 'days' as const,
    scale: 1000 * 60 * 60 * 24,
  },
].reverse()

export function parseTime(
  milliseconds: number,
  roundTo: (typeof timeUnits)[number]['plural'] = 'seconds',
) {
  if (typeof milliseconds !== 'number') {
    return 'Incorrect time'
  }

  const roundIndex = timeUnits.findIndex(({ plural }) => plural === roundTo)
  if (milliseconds === 0 || milliseconds < timeUnits[roundIndex].scale) {
    return `0 ${roundTo}`
  }

  milliseconds = Math.round(milliseconds)

  const unitStrings = timeUnits.reduce((unitStrings, unit, index) => {
    if (index <= roundIndex && milliseconds >= unit.scale) {
      const unitValue = Math.floor(milliseconds / unit.scale)
      if (unitValue > 0) {
        milliseconds -= unitValue * unit.scale
        unitStrings.push(`${unitValue} ${unitValue === 1 ? unit.singular : unit.plural}`)
      }
    }

    return unitStrings
  }, [] as string[])

  if (unitStrings.length >= 2) {
    unitStrings.splice(unitStrings.length - 1, 0, 'and')
  }
  return unitStrings.join(' ')
}

interface ParseTimestampOptions {
  noDateSymbol: string
  onlyDate: boolean
  onlyTime: boolean
  timeZone: string
}

export function parseTimestamp(
  timestamp?: number | Date,
  opts: Partial<ParseTimestampOptions> = {},
) {
  if (timestamp === null || timestamp === undefined) {
    return opts.noDateSymbol ?? '-'
  }

  const dt = timestamp instanceof Date ? timestamp : new Date(timestamp)
  const locale = 'pl'

  if (opts.onlyDate && !opts.onlyTime) {
    return dt.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: opts.timeZone,
    })
  } else if (opts.onlyTime) {
    return dt.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: opts.timeZone,
    })
  }
  return dt.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: opts.timeZone,
  })
}
