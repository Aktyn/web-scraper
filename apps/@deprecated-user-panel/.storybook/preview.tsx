import '@fontsource-variable/roboto-flex'
import { CssBaseline, ThemeProvider, useTheme } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react'
import React, { FC } from 'react'
import { mainThemes } from '../src/app/themes'

const GlobalStyles: FC = () => {
  const theme = useTheme()
  try {
    document.body.style.backgroundColor = theme?.palette.background.default
  } catch (error) {
    console.error('Failed to set background color', error)
  }
  return <CssBaseline />
}

export const decorators = [
  withThemeFromJSXProvider({
    themes: mainThemes,
    defaultTheme: 'blue',
    Provider: ThemeProvider,
    GlobalStyles: GlobalStyles,
  }),
]

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    backgrounds: {
      default: 'Transparent',
      values: [
        {
          name: 'Default',
          value: '#1b2632',
        },
        {
          name: 'White',
          value: '#fff',
        },
        {
          name: 'Transparent',
          value: 'transparent',
        },
      ],
    },
  },
}

export default preview
