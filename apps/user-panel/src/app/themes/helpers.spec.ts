import { generateComplementaryColor, mixColors, rotateHue, setSaturation } from './helpers'

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

describe('rotateHue', () => {
  it('should rotate hue by 180 degrees', () => {
    expect(rotateHue('#ff0000', 180)).toBe('#00ffff')
    expect(rotateHue('#00ff00', 180)).toBe('#ff00ff')
    expect(rotateHue('#0000ff', 180)).toBe('#ffff00')
  })

  it('should handle alpha channel', () => {
    expect(rotateHue('#ff0000ff', 180)).toBe('#00ffffff')
    expect(rotateHue('#00ff00ff', 180)).toBe('#ff00ffff')
    expect(rotateHue('#0000ffff', 180)).toBe('#ffff00ff')
  })

  it('should handle degrees outside of 0-360 range', () => {
    expect(rotateHue('#ff0000', 540)).toBe('#00ffff')
    expect(rotateHue('#ff0000', -180)).toBe('#00ffff')
  })
})

describe('generateComplementaryColor', () => {
  it('should return color with hue rotated by 180 degrees', () => {
    expect(generateComplementaryColor('#90caf9')).toBe('#f9bf90')
    expect(generateComplementaryColor('#90caf937')).toBe('#f9bf9037')
  })
})
