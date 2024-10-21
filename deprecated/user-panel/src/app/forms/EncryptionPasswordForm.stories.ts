import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { EncryptionPasswordForm } from './EncryptionPasswordForm'

const meta = {
  title: 'Form/EncryptionPasswordForm',
  component: EncryptionPasswordForm,
  parameters: { EncryptionPasswordForm: 'fullscreen' },
  args: { onSave: fn() },
} satisfies Meta<typeof EncryptionPasswordForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
