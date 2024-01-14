import { float, int, tryParseJSON } from './parsers'

describe(int.name, () => {
  it('should return 0 when value is undefined', () => {
    expect(int(undefined)).toEqual(0)
  })

  it('should return 0 when value is empty string', () => {
    expect(int('')).toEqual(0)
  })

  it('should return 0 when value is not a number', () => {
    expect(int('foo')).toEqual(0)
  })

  it('should return the number when value is a number', () => {
    expect(int('123')).toEqual(123)
  })

  it('should return the number when value is a number with decimals', () => {
    expect(int('123.456')).toEqual(123)
  })
})

describe(float.name, () => {
  it('should return 0 when value is undefined', () => {
    expect(float(undefined)).toEqual(0)
  })

  it('should return 0 when value is empty string', () => {
    expect(float('')).toEqual(0)
  })

  it('should return 0 when value is not a number', () => {
    expect(float('foo')).toEqual(0)
  })

  it('should return the number when value is a number', () => {
    expect(float('123.456')).toEqual(123.456)
  })
})

describe(tryParseJSON.name, () => {
  it('should normally parse correct JSON string', () => {
    expect(tryParseJSON('{"a": 5}')).toStrictEqual({ a: 5 })
  })

  it('should fallback to null in case of error', () => {
    expect(tryParseJSON('{incorrect json}')).toBeNull()
  })
})
