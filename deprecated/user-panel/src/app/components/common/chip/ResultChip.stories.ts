import type { Meta, StoryObj } from '@storybook/react'
import { ResultChip } from './ResultChip'

const meta = {
  title: 'Common/Chip/ResultChip',
  component: ResultChip,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ResultChip>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: { type: 'success' },
}
export const Failure: Story = {
  args: { type: 'failure' },
}
