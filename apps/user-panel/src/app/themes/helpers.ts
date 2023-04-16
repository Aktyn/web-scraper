import { type ColorFormat, decomposeColor, recomposeColor } from '@mui/material'
import { mix } from '@web-scraper/common'

export function mixColors(color1: string, color2: string, factor: number, format?: ColorFormat) {
  const c1 = decomposeColor(color1)
  const c2 = decomposeColor(color2)
  if (c1.colorSpace !== c2.colorSpace || c1.values.length < 3 || c2.values.length < 3) {
    throw new Error('Colors must be of the same type and color space and have at least 3 channels')
  }

  const rgb = [0, 0, 0].map((_, i) => mix(c1.values[i], c2.values[i], factor))
  const alpha = mix(c1.values[3] ?? 1, c2.values[3] ?? 1, factor)
  if (alpha !== 1) {
    rgb.push(alpha)
  }

  return recomposeColor({
    values: rgb as [number, number, number],
    type: format ?? c1.type,
    colorSpace: c1.colorSpace,
  })
}

const rgbToLightness = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return (1 / 2) * (max + min)
}

const rgbToSaturation = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = rgbToLightness(r, g, b)

  return l === 0 || l === 1 ? 0 : (max - min) / (1 - Math.abs(2 * l - 1))
}

const rgbToHue = (r: number, g: number, b: number) => {
  let hue = Math.round((Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI)

  while (hue < 0) {
    hue = hue + 360
  }

  return hue
}

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  const hue = rgbToHue(r, g, b)
  const saturation = rgbToSaturation(r, g, b)
  const lightness = rgbToLightness(r, g, b)

  return [hue, saturation, lightness]
}

const customHslToRgb = (h: number, s: number, l: number) => {
  const C = (1 - Math.abs(2 * l - 1)) * s
  const hPrime = h / 60
  const X = C * (1 - Math.abs((hPrime % 2) - 1))
  const m = l - C / 2
  const withLight = (r: number, g: number, b: number) =>
    [r + m, g + m, b + m] as [number, number, number]

  if (hPrime <= 1) {
    return withLight(C, X, 0)
  } else if (hPrime <= 2) {
    return withLight(X, C, 0)
  } else if (hPrime <= 3) {
    return withLight(0, C, X)
  } else if (hPrime <= 4) {
    return withLight(0, X, C)
  } else if (hPrime <= 5) {
    return withLight(X, 0, C)
  } else if (hPrime <= 6) {
    return withLight(C, 0, X)
  }
  return [0, 0, 0]
}

export function setSaturation(color: string, targetSaturation: number) {
  const c = decomposeColor(color)
  const hsl = rgbToHsl(c.values[0], c.values[1], c.values[2])

  const rgb = customHslToRgb(
    hsl[0],
    -targetSaturation,
    hsl[2] / Math.abs(hsl[1] / targetSaturation),
  )
    .map(Math.floor)
    .join(',')

  return c.values.length === 4 ? `rgba(${rgb}, ${c.values[3]})` : `rgb(${rgb})`
}

function hueToRgb(t: number, p: number, q: number) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/** Returns hex string color representation */
export function rotateHue(hexColor: string, degrees: number) {
  // eslint-disable-next-line prefer-const
  let [r, g, b, a] = decomposeColor(hexColor).values
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s: number
  const l = (max + min) / 2

  if (max == min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  // Rotate hue by 180 degrees
  h = (h + degrees / 360) % 1

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const rHex = Math.round(hueToRgb(h + 1 / 3, p, q) * 255)
    .toString(16)
    .padStart(2, '0')
  const gHex = Math.round(hueToRgb(h, p, q) * 255)
    .toString(16)
    .padStart(2, '0')
  const bHex = Math.round(hueToRgb(h - 1 / 3, p, q) * 255)
    .toString(16)
    .padStart(2, '0')
  const aHex = a
    ? Math.round(a * 255)
        .toString(16)
        .padStart(2, '0')
    : ''

  return `#${rHex}${gHex}${bHex}${aHex}`
}

export function generateComplementaryColor(hexColor: string) {
  return rotateHue(hexColor, 180)
}
