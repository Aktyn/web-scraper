import { createTheme } from '@mui/material/styles'

const retinaDisplayMediaQuery = '@media only screen and (-webkit-min-device-pixel-ratio: 2)'

export const baseTheme = createTheme({
  typography: {
    fontFamily: ['Roboto', 'Helvetica', 'Arial', 'Courier', 'sans-serif'].join(','),
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
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '1rem',
        },
      },
    },
  },
})
