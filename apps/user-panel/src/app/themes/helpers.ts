import { decomposeColor, recomposeColor } from '@mui/material'

//TODO: unit tests
export function mixColors(color1: string, color2: string, factor: number) {
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
    type: c1.type,
    colorSpace: c1.colorSpace,
  })
}
