import type { Meta, StoryObj } from '@storybook/react'
import { UrlButton } from './UrlButton'

const meta = {
  title: 'Common/Button/UrlButton',
  component: UrlButton,
  parameters: { layout: 'centered' },
  args: { children: 'http://example.com' },
} satisfies Meta<typeof UrlButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const ReadOnly: Story = { args: { readOnly: true } }
export const MaxWidth: Story = { args: { maxWidth: '6rem' } }
