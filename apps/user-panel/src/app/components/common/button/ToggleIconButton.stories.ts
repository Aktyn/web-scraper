import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ToggleIconButton } from './ToggleIconButton'

const meta = {
  title: 'Common/Button/ToggleIconButton',
  component: ToggleIconButton,
  parameters: { layout: 'centered' },
  args: { onToggle: fn(), openTooltip: 'Close', closeTooltip: 'Edit' },
} satisfies Meta<typeof ToggleIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = { args: { open: true } }
export const Closed: Story = { args: { open: false } }
