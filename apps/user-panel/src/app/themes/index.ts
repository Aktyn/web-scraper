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
  //TODO: adjust secondary colors
  red: generateColorizedTheme({ primary: red, secondary: red }),
  pink: generateColorizedTheme({ primary: pink, secondary: red }),
  purple: generateColorizedTheme({ primary: purple, secondary: red }),
  deepPurple: generateColorizedTheme({ primary: deepPurple, secondary: red }),
  indigo: generateColorizedTheme({ primary: indigo, secondary: red }),
  blue: generateColorizedTheme({ primary: blue, secondary: red }),
  lightBlue: generateColorizedTheme({ primary: lightBlue, secondary: red }),
  cyan: generateColorizedTheme({ primary: cyan, secondary: red }),
  teal: generateColorizedTheme({ primary: teal, secondary: red }),
  green: generateColorizedTheme({ primary: green, secondary: red }),
  lightGreen: generateColorizedTheme({ primary: lightGreen, secondary: red }),
  lime: generateColorizedTheme({ primary: lime, secondary: red }),
  yellow: generateColorizedTheme({ primary: yellow, secondary: red }),
  amber: generateColorizedTheme({ primary: amber, secondary: red }),
  orange: generateColorizedTheme({ primary: orange, secondary: red }),
  deepOrange: generateColorizedTheme({ primary: deepOrange, secondary: red }),
  brown: generateColorizedTheme({ primary: brown, secondary: red }),
  grey: generateColorizedTheme({ primary: grey, secondary: red }),
  blueGrey: generateColorizedTheme({ primary: blueGrey, secondary: red }),
}
