import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors'
import { generateColorizedTheme } from './generators/generateColorizedTheme'

export * from './helpers'
export * from './baseTheme'

export const mainThemes = {
  red: generateColorizedTheme({ primary: red }),
  pink: generateColorizedTheme({ primary: pink }),
  purple: generateColorizedTheme({ primary: purple }),
  deepPurple: generateColorizedTheme({ primary: deepPurple }),
  indigo: generateColorizedTheme({ primary: indigo }),
  blue: generateColorizedTheme({ primary: blue }),
  lightBlue: generateColorizedTheme({ primary: lightBlue }),
  cyan: generateColorizedTheme({ primary: cyan }),
  teal: generateColorizedTheme({ primary: teal }),
  green: generateColorizedTheme({ primary: green }),
  lightGreen: generateColorizedTheme({ primary: lightGreen }),
  lime: generateColorizedTheme({ primary: lime }),
  yellow: generateColorizedTheme({ primary: yellow }),
  amber: generateColorizedTheme({ primary: amber }),
  orange: generateColorizedTheme({ primary: orange }),
  deepOrange: generateColorizedTheme({ primary: deepOrange }),
  brown: generateColorizedTheme({ primary: brown }),
  grey: generateColorizedTheme({ primary: grey }),
  blueGrey: generateColorizedTheme({ primary: blueGrey }),
}
