import type { Meta, StoryObj } from '@storybook/react'
import { TermChip } from './TermChip'
import { termsDetails } from '../../../utils/terms'

const meta = {
  title: 'Common/Chip/TermChip',
  component: TermChip,
  parameters: { layout: 'centered' },
  argTypes: {
    term: { control: 'select', options: termsDetails.map((term) => term.key) },
  },
  args: { term: 'action', size: 'medium' },
} satisfies Meta<typeof TermChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { term: 'action' },
}

export const Error: Story = {
  args: { color: 'error' },
}
