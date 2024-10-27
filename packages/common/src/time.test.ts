import { parseTime, parseTimestamp } from './time'

describe('parseTime', () => {
  it('should round and parse small values', () => {
    expect(parseTime(500.7, 'milliseconds')).toBe('501 milliseconds')
  })

  it('should return singular unit names', () => {
    expect(parseTime(1234, 'milliseconds')).toBe('1 second and 234 milliseconds')
  })

  it('should not contain unneccesary zeros at end', () => {
    expect(parseTime(4500000, 'milliseconds')).toBe('1 hour and 15 minutes')
  })

  it('should not contain unneccesary zeros in the middle', () => {
    expect(parseTime(3615000)).toBe('1 hour and 15 seconds')
  })

  it('should round result to given unit (to seconds by default)', () => {
    expect(parseTime(4508765, 'minutes')).toBe('1 hour and 15 minutes')
    expect(parseTime(15999)).toBe('15 seconds')
  })

  it('should round result to given unit even if there is not enough milliseconds', () => {
    expect(parseTime(0, 'minutes')).toBe('0 minutes')
  })

  it("should return 'Incorrect time' if milliseconds argument is not a number", () => {
    expect(parseTime('not a number' as never)).toBe('Incorrect time')
  })
})

describe('parseTimestamp', () => {
  it('should return proper symbol when given incorrect timestamp as an argument', () => {
    expect(parseTimestamp(null as never)).toBe('-')
    expect(parseTimestamp(undefined)).toBe('-')
    expect(parseTimestamp(undefined, { noDateSymbol: 'Nope' })).toBe('Nope')
  })

  it('should return parsed date and time by default', () => {
    expect(parseTimestamp(1645056024193)).toBe('17.02.2022, 01:00')
  })

  it('should be able to return only parsed time or only parsed date', () => {
    expect(parseTimestamp(1645056024193, { onlyDate: true })).toBe('17.02.2022')
    expect(parseTimestamp(1645056024193, { onlyTime: true })).toBe('01:00')
    expect(parseTimestamp(1645056024193, { onlyDate: true, onlyTime: true })).toBe('01:00')
  })
})
