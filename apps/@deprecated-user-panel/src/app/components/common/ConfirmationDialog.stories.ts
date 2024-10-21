import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ConfirmationDialog } from './ConfirmationDialog'

const meta = {
  title: 'Common/Dialog/ConfirmationDialog',
  component: ConfirmationDialog,
  parameters: { layout: 'centered' },
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    titleContent: 'Dialog title',
    children: 'Dialog content\nFoo',
    autoCloseDuration: 10_000,
  },
} satisfies Meta<typeof ConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { loading: true } }
