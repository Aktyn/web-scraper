import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ToggleButton } from './ToggleButton'

const meta = {
  title: 'Common/Button/ToggleButton',
  component: ToggleButton,
  parameters: { layout: 'centered' },
  args: { value: '', onToggle: fn(), size: 'medium', children: 'Toggle button' },
} satisfies Meta<typeof ToggleButton>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = { args: { active: true } }
export const Inactive: Story = { args: { active: false } }
