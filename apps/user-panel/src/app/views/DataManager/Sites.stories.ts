import type { Meta, StoryObj } from '@storybook/react'
import { Sites } from './Sites'

const meta = {
  title: 'Site/Sites',
  component: Sites,
  parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof Sites>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
