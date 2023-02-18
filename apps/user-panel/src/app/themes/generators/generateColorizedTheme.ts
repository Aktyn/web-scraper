import { createTheme, lighten } from '@mui/material'
import { common, red } from '@mui/material/colors'
import deepmerge from 'deepmerge'
import { baseTheme } from '../base'
import { mixColors } from '../helpers'

type ColorSchema = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

interface ColorizedThemeProps {
  primary: ColorSchema
  secondary: ColorSchema
}

export function generateColorizedTheme({ primary, secondary }: ColorizedThemeProps) {
  const backgroundDefault = primary[800]
  const textSecondary = mixColors(primary[50], primary[800], 0.4)
  const divider = lighten(backgroundDefault, 0.05)

  return deepmerge(
    baseTheme,
    createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: primary[600],
        },
        secondary: {
          main: secondary[600],
        },
        background: {
          default: backgroundDefault,
          paper: primary[700],
        },
        text: {
          primary: primary[50],
          secondary: textSecondary,
        },
        error: {
          main: red[400],
        },
        divider,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              '& ::-webkit-scrollbar': {
                width: 8,
                height: 6,
              },
              //TODO
              // '& ::-webkit-scrollbar-track': {
              //   backgroundColor: lighten(mainContainerBackground, 0.05),
              //   borderRadius: 8,
              // },
              // '& ::-webkit-scrollbar-thumb': {
              //   backgroundColor: lighten(mainContainerBackground, 0.15),
              //   borderRadius: 8,
              // },
              // '& ::-webkit-scrollbar-thumb:hover': {
              //   backgroundColor: lighten(mainContainerBackground, 0.25),
              // },
            },
          },
        },
        MuiButton: {
          variants: [
            {
              props: { variant: 'contained', color: 'primary' },
              style: {
                '&:not([disabled])': {
                  color: common.white,
                },
              },
            },
            {
              props: { variant: 'contained', color: 'secondary' },
              style: {
                '&:not([disabled])': {
                  color: common.white,
                },
              },
            },
            {
              props: { variant: 'contained', color: 'error' },
              style: {
                color: red[50],
                '&:hover': {
                  color: common.white,
                  backgroundColor: red[200],
                },
              },
            },
          ],
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: divider,
            },
            head: {
              fontWeight: 'bold',
              color: textSecondary,
            },
          },
        },
      },
    }),
  )
}
