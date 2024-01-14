import { forceArray, getDeepProperty, omit, pick, sortNumbers } from './common'

describe(pick.name, () => {
  it('should return object left only with given properties', () => {
    expect(pick({ a: 5, b: 6, c: 7 }, 'a', 'b')).toStrictEqual({ a: 5, b: 6 })
  })
})

describe(omit.name, () => {
  it('should return object without given properties', () => {
    expect(omit({ a: 5, b: 6, c: 7 }, 'a', 'b')).toStrictEqual({ c: 7 })
  })
})

describe(getDeepProperty.name, () => {
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

  it('should return fallback value if there is no value found', () => {
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
      'level1.level2.level3.nonExistingValue' as never,
    )

    expect(deepProperty).toBe(null)
  })
})

describe(forceArray.name, () => {
  it('should return an array when given a non-array value', () => {
    expect(forceArray('hello')).toStrictEqual(['hello'])
    expect(forceArray(42)).toStrictEqual([42])
    expect(forceArray({ foo: 'bar' })).toStrictEqual([{ foo: 'bar' }])
  })

  it('should return the same array when given an array value', () => {
    const arr = [1, 2, 3]
    expect(forceArray(arr)).toBe(arr)
  })
})

describe(sortNumbers.name, () => {
  it('should sort an array of objects in ascending order by a given numeric key', () => {
    const data = [
      { id: 1, value: 5 },
      { id: 2, value: 3 },
      { id: 3, value: 7 },
    ]
    const sortedData = data.sort(sortNumbers('value', 'asc'))
    expect(sortedData).toStrictEqual([
      { id: 2, value: 3 },
      { id: 1, value: 5 },
      { id: 3, value: 7 },
    ])
  })

  it('should sort an array of objects in descending order by a given numeric key', () => {
    const data = [
      { id: 1, value: 5 },
      { id: 2, value: 3 },
      { id: 3, value: 7 },
    ]
    const sortedData = data.sort(sortNumbers('value', 'desc'))
    expect(sortedData).toStrictEqual([
      { id: 3, value: 7 },
      { id: 1, value: 5 },
      { id: 2, value: 3 },
    ])
  })

  it('should sort an array of objects in ascending order by a given numeric key with negative values', () => {
    const data = [
      { id: 1, value: -5 },
      { id: 2, value: 3 },
      { id: 3, value: 7 },
    ]
    const sortedData = data.sort(sortNumbers('value', 'asc'))
    expect(sortedData).toStrictEqual([
      { id: 1, value: -5 },
      { id: 2, value: 3 },
      { id: 3, value: 7 },
    ])
  })

  it('should sort an array of objects in descending order by a given numeric key with negative values', () => {
    const data = [
      { id: 1, value: -5, stringValue: 'foo' },
      { id: 2, value: 3, stringValue: 'foo' },
      { id: 3, value: 7, stringValue: 'foo' },
    ]
    const sortedData = data.sort(sortNumbers('value', 'desc'))
    expect(sortedData).toStrictEqual([
      { id: 3, value: 7, stringValue: 'foo' },
      { id: 2, value: 3, stringValue: 'foo' },
      { id: 1, value: -5, stringValue: 'foo' },
    ])
  })
})
