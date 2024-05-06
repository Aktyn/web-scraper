import { ThumbUpRounded } from '@mui/icons-material'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ConfirmableButton } from './ConfirmableButton'

const meta = {
  title: 'Common/ConfirmableButton',
  component: ConfirmableButton,
  parameters: { layout: 'centered' },
  args: { children: 'Foo', variant: 'outlined', endIcon: <ThumbUpRounded />, onConfirm: fn() },
} satisfies Meta<typeof ConfirmableButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { durationMs: 5_000 },
}
