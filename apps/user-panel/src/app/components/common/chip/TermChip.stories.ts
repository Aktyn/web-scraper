import type { Meta, StoryObj } from '@storybook/react'
import { TermChip as TermChipComponent } from './TermChip'
import { termsDetails } from '../../../utils/terms'

const meta = {
  title: 'components/common/TermChip',
  component: TermChipComponent,
  parameters: { layout: 'centered' },
  argTypes: {
    term: { control: 'select', options: termsDetails.map((term) => term.key) },
  },
  args: { term: 'action', size: 'medium' },
} satisfies Meta<typeof TermChipComponent>

export default meta
type Story = StoryObj<typeof meta>

export const TermChip: Story = {
  args: { term: 'action' },
}

export const TermChipError: Story = {
  args: { color: 'error' },
}
