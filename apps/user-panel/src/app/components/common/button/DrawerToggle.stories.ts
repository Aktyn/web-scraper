import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DrawerToggle } from './DrawerToggle'

const meta = {
  title: 'Common/Button/DrawerToggle',
  component: DrawerToggle,
  parameters: { layout: 'centered' },
  args: { children: 'Foo', onToggle: fn() },
} satisfies Meta<typeof DrawerToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Opened: Story = {
  args: { open: true },
}

export const Closed: Story = {
  args: { open: false },
}
