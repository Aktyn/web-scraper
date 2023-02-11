import { int } from '@web-scrapper/common'
import { describe, expect, it } from 'vitest'

describe('Dummy test', () => {
  it('should pass', () => {
    expect(int('13.37')).toBe(13)
  })
})
