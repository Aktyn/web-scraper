import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { FullViewLoader } from './FullViewLoader'

const meta = {
  title: 'Common/FullViewLoader',
  component: FullViewLoader,
  decorators: [
    (Story) => (
      <Box height="100vh">
        <Story />
      </Box>
    ),
  ],
  parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof FullViewLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
