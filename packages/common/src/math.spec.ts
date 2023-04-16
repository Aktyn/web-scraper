import { describe, expect, it } from 'vitest'

import { mix } from './math'

describe('mix', () => {
  it('should return mix of two values by given factor', () => {
    expect(mix(5, 10, 0.5)).toBe(7.5)
  })
})
