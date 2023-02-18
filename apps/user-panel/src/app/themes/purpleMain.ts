import { purple, red } from '@mui/material/colors'
import { generateColorizedTheme } from './generators/generateColorizedTheme'

export const purpleMain = generateColorizedTheme({
  primary: purple,
  secondary: red,
})
