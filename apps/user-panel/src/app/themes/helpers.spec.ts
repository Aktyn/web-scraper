import { generateComplementaryColor, mixColors, setSaturation } from './helpers'

describe('mixColors', () => {
  it('should create an instance', () => {
    expect(mixColors('#ffffff', '#000000', 0.5)).toBe('rgb(127, 127, 127)')
  })
})

describe('setSaturation', () => {
  it('should return color with given saturation', () => {
    expect(setSaturation('#6a1b9a', 0.35)).toBe('rgb(48,29,59)')
    expect(setSaturation('#00838f', 0.15)).toBe('rgb(9,11,12)')
  })
})

describe('generateComplementaryColor', () => {
  it('should return color with hue rotated by 180 degrees', () => {
    expect(generateComplementaryColor('#90caf9')).toBe('#f9bf90')
    expect(generateComplementaryColor('#90caf937')).toBe('#f9bf9037')
  })
})
