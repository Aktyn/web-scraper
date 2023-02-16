import { common, purple, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

export const purpleMain = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: purple[600],
    },
    secondary: {
      main: red[600],
    },
    background: {
      default: purple[800],
      paper: purple[700],
    },
    text: {
      primary: purple[50],
      secondary: purple[200],
    },
    error: {
      main: red[400],
    },
    divider: purple[700],
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
