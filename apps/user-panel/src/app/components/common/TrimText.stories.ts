import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { TrimText } from './TrimText'

const meta = {
  title: 'Common/TrimText',
  component: TrimText,
  parameters: { layout: 'centered' },
  argTypes: {
    maxLength: { control: { type: 'range', min: 1, max: 64, step: 1 } },
  },
  args: {
    children: 'Example text that will be trimmed',
    maxLength: 20,
  },
} satisfies Meta<typeof TrimText>

export default meta
type Story = StoryObj<typeof meta>

export const LeftSide: Story = {
  args: { side: 'left', children: 'Trimmed to 22 characters', maxLength: 22 },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('...ed to 22 characters')
    await expect(text).toBeInTheDocument()
  },
}
export const RightSide: Story = {
  args: { side: 'right' },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Example text that...')
    await expect(text).toBeInTheDocument()
  },
}
export const CustomAffix: Story = {
  args: { children: 'Custom suffix foo', maxLength: 16, affix: '●●●' },
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Custom suffix●●●')
    await expect(text).toBeInTheDocument()
  },
}
