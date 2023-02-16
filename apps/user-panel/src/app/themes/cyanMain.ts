import { common, cyan, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'
import { mixColors } from './helpers'

export const cyanMain = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: cyan[600],
    },
    secondary: {
      main: red[600],
    },
    background: {
      default: cyan[800],
      paper: cyan[700],
    },
    text: {
      primary: cyan[50],
      secondary: mixColors(cyan[50], cyan[800], 0.4),
    },
    error: {
      main: red[400],
    },
    divider: cyan[700],
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
  },
})
