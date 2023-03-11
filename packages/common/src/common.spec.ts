import { describe, expect, it } from 'vitest'

import { getDeepProperty, omit, pick } from './common'

describe('pick', () => {
  it('should return object left only with given properties', () => {
    expect(pick({ a: 5, b: 6, c: 7 }, 'a', 'b')).toStrictEqual({ a: 5, b: 6 })
  })
})

describe('omit', () => {
  it('should return object without given properties', () => {
    expect(omit({ a: 5, b: 6, c: 7 }, 'a', 'b')).toStrictEqual({ c: 7 })
  })
})

describe('getDeepProperty', () => {
  it('should return value from nested object by given path string', () => {
    const deepProperty = getDeepProperty(
      {
        level1: {
          level2: {
            level3: {
              targetValue: 1337,
            },
            sideValue3: 'z',
          },
          sideValue2: 'y',
        },
        sideValue1: 'x',
      },
      'level1.level2.level3.targetValue',
    )

    expect(deepProperty).toBe(1337)
  })
})
