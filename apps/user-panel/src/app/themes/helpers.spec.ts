import { mixColors, setSaturation } from './helpers'

describe('mixColors', () => {
  it('should create an instance', () => {
    expect(mixColors('#ffffff', '#000000', 0.5)).toBe('rgb(127, 127, 127)')
  })
})

describe('setSaturation', () => {
  it('should return color with given saturation', () => {
    expect(setSaturation('#6a1b9a', 0.35)).toBe('rgb(98,59,121)')
    expect(setSaturation('#00838f', 0.15)).toBe('rgb(60,80,82)')
  })
})
