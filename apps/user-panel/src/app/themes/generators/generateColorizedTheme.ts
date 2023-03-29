import type { CSSInterpolation, ThemeOptions } from '@mui/material'
import {
  alpha,
  createTheme,
  darken,
  dividerClasses,
  drawerClasses,
  lighten,
  tableRowClasses,
} from '@mui/material'
import { common, green, grey, lightBlue, lightGreen, orange, red } from '@mui/material/colors'
import deepmerge from 'deepmerge'
import { Config } from '../../config'
import { baseTheme, baseThemeOptions } from '../baseTheme'
import { generateComplementaryColor, mixColors, setSaturation } from '../helpers'

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

function convertPrimaryToSecondary(schema: Readonly<ColorSchema>) {
  const converted = {} as { [_: string]: string }
  for (const key in schema) {
    converted[key] = generateComplementaryColor(schema[key as never])
  }
  return converted as ColorSchema
}

interface ColorizedThemeProps {
  primary: ColorSchema
  secondary?: ColorSchema
}

export function generateColorizedTheme({
  primary,
  secondary = convertPrimaryToSecondary(primary),
}: ColorizedThemeProps) {
  const backgroundDefault = setSaturation(primary[800], Config.BACKGROUND_SATURATION)
  const paperBackgroundDefault = setSaturation(primary[600], Config.BACKGROUND_SATURATION)

  const textPrimary = primary[50]
  const textSecondary = mixColors(primary[50], primary[800], 0.4)

  const divider = lighten(backgroundDefault, 0.05)
  const paperDivider = lighten(paperBackgroundDefault, 0.1)

  const glassmorphicPaper: CSSInterpolation = {
    borderColor: lighten(paperBackgroundDefault, 0.2),
    backgroundColor: alpha(paperBackgroundDefault, 0.5),
    backdropFilter: 'blur(4px)',
  }

  return createTheme(
    deepmerge<ThemeOptions>(
      baseThemeOptions,
      {
        palette: {
          mode: 'dark',
          primary: {
            main: primary[200],
          },
          secondary: {
            main: secondary[200],
          },
          background: {
            default: backgroundDefault,
            paper: paperBackgroundDefault,
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
          grey: grey,
          error: {
            main: red[200],
          },
          warning: {
            main: orange[200],
          },
          success: {
            main: green[200],
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
                '& ::-webkit-scrollbar-track': {
                  backgroundColor: lighten(backgroundDefault, 0.05),
                },
                '& ::-webkit-scrollbar-thumb': {
                  backgroundColor: lighten(backgroundDefault, 0.15),
                },
                '& ::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: lighten(backgroundDefault, 0.25),
                },
              },
              '.notistack-MuiContent': {
                borderRadius: '2rem',
                border: '1px solid',
                backdropFilter: 'blur(2px)',
              },
              '.notistack-MuiContent-success': {
                backgroundColor: alpha(lightGreen[400], 0.5),
                borderColor: lighten(lightGreen[400], 0.1),
                color: lightGreen[50],
              },
              '.notistack-MuiContent-error': {
                backgroundColor: alpha(red[400], 0.5),
                borderColor: lighten(red[400], 0.1),
                color: red[50],
              },
              '.notistack-MuiContent-info': {
                backgroundColor: alpha(lightBlue[400], 0.5),
                borderColor: lighten(lightBlue[400], 0.1),
                color: lightBlue[50],
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
                    '&:not(:hover)': {
                      backgroundColor: primary[600],
                    },
                    '&:hover': {
                      backgroundColor: primary[500],
                    },
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
          MuiTableRow: {
            styleOverrides: {
              root: {
                [`&.${tableRowClasses.hover}`]: {
                  transition: baseTheme.transitions.create('background-color'),
                },
                [`&.${tableRowClasses.hover}:hover`]: {
                  backgroundColor: divider,
                },
                '&:nth-of-type(even)': {
                  backgroundColor: alpha(common.white, 0.01),
                  [`&.${tableRowClasses.head}`]: {
                    backgroundColor: 'inherit',
                  },
                },
                '&:nth-of-type(odd)': {
                  backgroundColor: alpha(common.black, 0.01),
                  [`&.${tableRowClasses.head}`]: {
                    backgroundColor: 'inherit',
                  },
                },
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: alpha(darken(backgroundDefault, 0.2), 0.8),
                border: `1px solid ${lighten(backgroundDefault, 0.1)}`,
                color: textPrimary,
                backdropFilter: 'blur(2px)',
                boxShadow: '0 1px 2px #0004',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                [`.${dividerClasses.root}`]: {
                  borderColor: paperDivider,
                },
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: glassmorphicPaper,
            },
          },
          MuiDrawer: {
            styleOverrides: {
              root: {
                [`& > .${drawerClasses.paper}`]: glassmorphicPaper,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: glassmorphicPaper,
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: primary[100],
                '&:hover': {
                  color: primary[50],
                },
              },
            },
          },
        },
      },
      { clone: true },
    ),
  )
}
