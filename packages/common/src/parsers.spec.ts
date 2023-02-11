import { describe, expect, it } from 'vitest'

import { int } from './parsers'

describe('int', () => {
  it('should return 0 when value is undefined', () => {
    expect(int()).toEqual(0)
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
