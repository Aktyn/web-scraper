import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SearchInput } from './SearchInput'

const meta = {
  title: 'Common/Input/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
  args: { value: '', onChange: fn(), size: 'medium' },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { value: 'Foo' } }
