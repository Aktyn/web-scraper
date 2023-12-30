import * as colors from '@mui/material/colors'
import { generateColorizedTheme } from './generators/generateColorizedTheme'
import { Config } from '../config'

export * from './helpers'
export * from './baseTheme'

const palette = [
  'red',
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'lightGreen',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deepOrange',
  'brown',
  'grey',
  'blueGrey',
] as const

type PaletteColorName = (typeof palette)[number]

function generatePalette(saturation = Config.DEFAULT_BACKGROUND_SATURATION) {
  return palette.reduce(
    (themes, colorName) => {
      themes[colorName] = generateColorizedTheme({
        // eslint-disable-next-line import/namespace
        primary: colors[colorName],
        saturation,
      })
      return themes
    },
    {} as { [_ in PaletteColorName]: ReturnType<typeof generateColorizedTheme> },
  )
}

export const mainThemes = generatePalette()

export function updateThemes(saturation: number) {
  const newPalette = generatePalette(saturation)

  for (const colorName of Object.keys(mainThemes) as PaletteColorName[]) {
    Object.assign(mainThemes[colorName], newPalette[colorName])
  }
}
