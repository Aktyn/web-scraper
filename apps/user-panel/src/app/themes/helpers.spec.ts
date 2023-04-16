import { describe, expect, it } from 'vitest'
import { generateComplementaryColor, mixColors, setSaturation } from './helpers'

describe('mixColors', () => {
  it('should return mixed color by given factor', () => {
    expect(mixColors('#ffffff', '#000000', 0.5)).toBe('rgb(127, 127, 127)')
  })

  it('should correctly mix alpha channel', () => {
    expect(mixColors('#ffffffff', '#00000000', 0.5)).toBe('rgba(127, 127, 127, 0.5)')
  })

  it('should handle alpha channel if only one color has it', () => {
    expect(mixColors('#ff00ff40', '#000000', 0.75)).toBe('rgba(63, 0, 63, 0.81275)')
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
