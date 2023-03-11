import '@fontsource/roboto-flex/variable.css'
import { backdropClasses } from '@mui/material'
import type { ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material/styles'

const retinaDisplayMediaQuery = '@media only screen and (-webkit-min-device-pixel-ratio: 2)'

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
        paper: {
          borderRadius: '1rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          [`& > .${backdropClasses.root}`]: {
            backdropFilter: 'blur(4px)',
          },
        },
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
