import '@fontsource-variable/roboto-flex'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react'
import { mainThemes } from '../src/app/themes'

export const decorators = [
  withThemeFromJSXProvider({
    themes: mainThemes,
    defaultTheme: 'blue',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
]

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    backgrounds: {
      default: 'default',
      values: [
        {
          name: 'default',
          value: '#1b2632',
        },
        {
          name: 'while',
          value: '#fff',
        },
      ],
    },
  },
}

export default preview
