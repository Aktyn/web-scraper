import { LabelRounded } from '@mui/icons-material'
import type { Meta, StoryObj } from '@storybook/react'
import { ReadonlyField } from './ReadonlyField'

const meta = {
  title: 'Form/ReadonlyField',
  component: ReadonlyField,
  parameters: { layout: 'centered' },
  args: {
    label: 'Readonly field',
    value: 'Readonly value',
    showBorder: false,
  },
} satisfies Meta<typeof ReadonlyField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithBorder: Story = {
  args: { showBorder: true },
}

export const WithIcon: Story = {
  args: { icon: <LabelRounded /> },
}
