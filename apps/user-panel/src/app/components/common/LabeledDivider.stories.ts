import type { Meta, StoryObj } from '@storybook/react'
import { LabeledDivider } from './LabeledDivider'

const meta = {
  title: 'Common/LabeledDivider',
  component: LabeledDivider,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Foo', height: '100vh' },
} satisfies Meta<typeof LabeledDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
