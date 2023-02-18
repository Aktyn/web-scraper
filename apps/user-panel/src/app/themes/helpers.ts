import { type ColorFormat, decomposeColor, recomposeColor } from '@mui/material'

//TODO: make sure it properly handles transparent colors especially when only one of the colors is transparent
export function mixColors(color1: string, color2: string, factor: number, format?: ColorFormat) {
  const c1 = decomposeColor(color1)
  const c2 = decomposeColor(color2)
  if (c1.type !== c2.type || c1.colorSpace !== c2.colorSpace) {
    throw new Error('Colors must be of the same type and color space')
  }

  const result = c1.values.map((c, i) => {
    return c * (1.0 - factor) + c2.values[i] * factor
  }) as typeof c1.values

  return recomposeColor({
    values: result,
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

const rgbToHsl = (r: number, g: number, b: number) => {
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
