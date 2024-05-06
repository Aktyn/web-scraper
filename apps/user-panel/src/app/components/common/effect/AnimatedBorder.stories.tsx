import { Button, Typography } from '@mui/material'
import { red } from '@mui/material/colors'
import type { Meta, StoryObj } from '@storybook/react'
import { AnimatedBorder } from './AnimatedBorder'

const meta = {
  title: 'Common/AnimatedBorder',
  component: AnimatedBorder,
  parameters: { layout: 'centered' },
  args: {
    active: true,
    borderRadius: '0.5rem',
    animationDuration: 800,
    offset: 0,
    rectProps: {
      strokeWidth: 4,
      strokeDasharray: [9, 9],
      stroke: red[300],
    },
  },
} satisfies Meta<typeof AnimatedBorder>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <Typography variant="h6" p="2rem" color="text.primary">
        Foo bar
      </Typography>
    ),
  },
}

export const AroundButton: Story = {
  args: {
    offset: -2,
    rectProps: {
      strokeWidth: 4,
      strokeDasharray: [10, 9],
      stroke: red[300],
    },
    borderRadius: 'max',
    children: (
      <Button variant="outlined" size="large">
        Foo bar
      </Button>
    ),
  },
}
