import '@fontsource-variable/roboto-flex'
import {} from '@mui/lab/themeAugmentation'
import { drawerClasses, type CSSInterpolation, type ThemeOptions } from '@mui/material'
import { common } from '@mui/material/colors'
import { alpha, createTheme } from '@mui/material/styles'

const retinaDisplayMediaQuery = '@media only screen and (-webkit-min-device-pixel-ratio: 2)'

const customPaper: CSSInterpolation = {
  borderRadius: '1rem',
  border: '1px solid',
  overflow: 'hidden',
}

export const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: ['"Roboto Flex Variable"', 'Roboto', 'Arial', 'sans-serif'].join(','),
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
        body: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        // disableInteractive: true,
        // disableFocusListener: true,
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
      defaultProps: {
        variant: 'outlined',
        color: 'primary',
      },
      styleOverrides: {
        root: {
          lineHeight: 1,
          borderRadius: '2rem',
        },
        textPrimary: {
          paddingInline: '0.5rem',
        },
        textSecondary: {
          paddingInline: '0.5rem',
        },
      },
    },
    MuiInputBase: {
      variants: [
        {
          props: { readOnly: true },
          style: {
            '&::after': {
              display: 'none',
            },
            '&:not(.always-show-border)::before': {
              borderBottom: 'none !important',
            },
            '&:hover.always-show-border::before': {
              borderColor: `${alpha(common.white, 0.7)} !important`,
              borderWidth: '1px !important',
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
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          height: '1.5rem',
          lineHeight: '1.5rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...customPaper,
          WebkitAppRegion: 'no-drag',
          backgroundImage: 'none',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: customPaper,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
        },
      },
      variants: [
        {
          props: { variant: 'outlined' },
          style: customPaper,
        },
      ],
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
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '1.25rem 1.5rem',
        },
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
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
          height: '0.25rem',
        },
      },
    },
  },
}

export const baseTheme = createTheme(baseThemeOptions)
