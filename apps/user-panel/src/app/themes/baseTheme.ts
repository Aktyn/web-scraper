import '@fontsource/roboto-flex/variable.css'
import type { CSSInterpolation, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material/styles'
// noinspection ES6UnusedImports
import {} from '@mui/lab/themeAugmentation'

const retinaDisplayMediaQuery = '@media only screen and (-webkit-min-device-pixel-ratio: 2)'

const customPaper: CSSInterpolation = {
  borderRadius: '1rem',
  border: '1px solid',
}

export const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: ['"Roboto FlexVariable"', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
          [retinaDisplayMediaQuery]: {
            fontSize: '12px',
          },
          overflow: 'hidden',

          '& ::-webkit-scrollbar': {
            width: 8,
            height: 6,
          },
          '& ::-webkit-scrollbar-track': {
            borderRadius: 8,
          },
          '& ::-webkit-scrollbar-thumb': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        caption: {
          lineHeight: 1,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          transition: `left 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            WebkitTextStrokeWidth: '0.5px',
            WebkitTextStrokeColor: 'currentColor',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: customPaper,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { ...customPaper, minWidth: '16rem', margin: '1rem', height: 'calc(100% - 2rem)' },
        paperAnchorRight: {
          borderRight: 'none',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          marginRight: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: customPaper,
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
        },
      },
    },
  },
}

export const baseTheme = createTheme(baseThemeOptions)
