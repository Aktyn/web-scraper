import { CheckRounded, CloseRounded } from '@mui/icons-material'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { IconToggle } from './IconToggle'

const meta = {
  title: 'Common/Button/IconToggle',
  component: IconToggle,
  parameters: { layout: 'centered' },
  args: {
    tooltipTitle: 'Foo tooltip',
    options: [
      { value: 'first', icon: <CheckRounded fontSize="inherit" /> },
      { value: 'second', icon: <CloseRounded fontSize="inherit" /> },
    ],
    onChange: fn(),
  },
} satisfies Meta<typeof IconToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Check: Story = { args: { value: 'first' } }
export const Close: Story = { args: { value: 'second' } }
