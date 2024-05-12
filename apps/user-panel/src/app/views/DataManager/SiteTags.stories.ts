import type { Meta, StoryObj } from '@storybook/react'
import { SiteTags } from './SiteTags'

const meta = {
  title: 'Site/SiteTags',
  component: SiteTags,
  parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof SiteTags>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
