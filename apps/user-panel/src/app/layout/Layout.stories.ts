import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from './Layout'

const meta = {
  title: 'Layout',
  component: Layout,
  parameters: { layout: 'fullscreen' },
  args: { children: '' },
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
