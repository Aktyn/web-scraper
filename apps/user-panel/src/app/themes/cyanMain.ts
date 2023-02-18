import { cyan, red } from '@mui/material/colors'
import { generateColorizedTheme } from './generators/generateColorizedTheme'

export const cyanMain = generateColorizedTheme({
  primary: cyan,
  secondary: red,
})
