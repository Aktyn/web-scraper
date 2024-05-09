import type { Meta, StoryObj } from '@storybook/react'
import { LabeledValuesList } from './LabeledValuesList'

const meta = {
  title: 'Common/LabeledValuesList',
  component: LabeledValuesList,
  parameters: { layout: 'centered' },
  args: {
    data: [
      { label: 'Foo 1', value: 'bar 1' },
      { label: 'Foo 2', value: 'bar 2' },
      { label: 'Empty value', value: null },
      { label: 'Foo 3', value: 'bar 3' },
    ],
  },
} satisfies Meta<typeof LabeledValuesList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
