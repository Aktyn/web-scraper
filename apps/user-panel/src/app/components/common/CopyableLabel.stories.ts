import type { Meta, StoryObj } from '@storybook/react'
import { CopyableLabel } from './CopyableLabel'

const meta = {
  title: 'Common/CopyableLabel',
  component: CopyableLabel,
  parameters: { layout: 'centered' },
  args: { children: 'Foo' },
} satisfies Meta<typeof CopyableLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
