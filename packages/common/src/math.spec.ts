import { gaussianRandom, gaussianRandomRange, mix, random, randomInt } from './math'

describe(mix.name, () => {
  it('should return mix of two values by given factor', () => {
    expect(mix(5, 10, 0.5)).toBe(7.5)
  })
})

describe(random.name, () => {
  it('should return a number within the specified range', () => {
    const min = 5
    const max = 10
    const result = random(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThanOrEqual(max)
  })

  it('should return different results for different calls', () => {
    const min = 5
    const max = 10
    const result1 = random(min, max)
    const result2 = random(min, max)
    expect(result1).not.toBe(result2)
  })

  it('should use the provided random function', () => {
    const min = 5
    const max = 10
    const mockRandom = jest.fn(() => 0.5)
    const result = random(min, max, mockRandom)
    expect(mockRandom).toHaveBeenCalled()
    expect(result).toBe(7.5)
  })
})

describe(randomInt.name, () => {
  it('should return a random integer between min and max (inclusive)', () => {
    const result = randomInt(1, 10)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(10)
    expect(Number.isInteger(result)).toBe(true)
  })

  it('should return a random integer between min and max (inclusive) using a custom random function', () => {
    const customRandomFunc = () => 0.5 // Always return 0.5 for testing purposes
    const result = randomInt(5, 15, customRandomFunc)
    expect(result).toBeGreaterThanOrEqual(5)
    expect(result).toBeLessThanOrEqual(15)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe(gaussianRandom.name, () => {
  it('should return a number between 0 and 1', () => {
    const result = gaussianRandom()
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('should return different results for different calls', () => {
    const result1 = gaussianRandom()
    const result2 = gaussianRandom()
    expect(result1).not.toBe(result2)
  })

  it('should return a number close to 0.5 on average', () => {
    let sum = 0
    const iterations = 10000
    for (let i = 0; i < iterations; i += 1) {
      sum += gaussianRandom()
    }
    const average = sum / iterations
    expect(average).toBeCloseTo(0.5, 1)
  })
})

describe(gaussianRandomRange.name, () => {
  it('should return a number within the specified range', () => {
    const min = 5
    const max = 10
    const result = gaussianRandomRange(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThanOrEqual(max)
  })

  it('should return different results for different calls', () => {
    const min = 5
    const max = 10
    const result1 = gaussianRandomRange(min, max)
    const result2 = gaussianRandomRange(min, max)
    expect(result1).not.toBe(result2)
  })

  it('should return a number close to the midpoint of the range on average', () => {
    const min = 5
    const max = 10
    let sum = 0
    const iterations = 1000
    for (let i = 0; i < iterations; i += 1) {
      sum += gaussianRandomRange(min, max)
    }
    const average = sum / iterations
    expect(average).toBeCloseTo((min + max) / 2, 1)
  })
})
