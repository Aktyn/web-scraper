import '@fontsource/roboto-flex/variable.css'
import { drawerClasses } from '@mui/material'
import type { CSSInterpolation, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material/styles'
// noinspection ES6UnusedImports
import {} from '@mui/lab/themeAugmentation'

const retinaDisplayMediaQuery = '@media only screen and (-webkit-min-device-pixel-ratio: 2)'

const customPaper: CSSInterpolation = {
  borderRadius: '1rem',
  border: '1px solid',
  overflow: 'hidden',
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
    MuiButton: {
      styleOverrides: {
        root: {
          lineHeight: 1,
          borderRadius: '2rem',
        },
      },
    },
    MuiInputBase: {
      variants: [
        {
          props: { readOnly: true },
          style: {
            '&::before, &::after': {
              borderBottom: 'none !important',
            },
          },
        },
      ],
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
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
        root: {
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'stretch',
          [`& > .${drawerClasses.paper}`]: {
            ...customPaper,
            flexGrow: 0,
            minWidth: '16rem',
            marginBlock: '1rem',
            height: 'calc(100% - 2rem)',
            position: 'static',
          },
          [`& > .${drawerClasses.paperAnchorRight}`]: {
            borderRight: 'none',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            marginRight: 0,
            marginLeft: '1rem',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: customPaper,
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: customPaper,
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
