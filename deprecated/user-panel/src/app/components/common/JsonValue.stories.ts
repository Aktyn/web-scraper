import type { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, within } from '@storybook/test'
import { JsonValue } from './JsonValue'

const jsonValue = JSON.stringify({ key1: 'value1', key2: 'value2', key3: 'value3' }, null, 2)

const meta = {
  title: 'Common/JsonValue',
  component: JsonValue,
  parameters: { layout: 'centered' },
  args: { children: jsonValue },
} satisfies Meta<typeof JsonValue>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const previewButton = canvas.getByRole('button')
    await expect(previewButton).toBeInTheDocument()

    await expect(canvas.queryByRole('presentation')).toBeNull()
    await userEvent.click(previewButton)
    await expect(screen.getByRole('presentation')).toBeInTheDocument()
    const background = screen.getByRole('presentation').firstChild as Element
    if (background) {
      await userEvent.click(background)
    }
  },
}
export const DisablePreview: Story = {
  args: { disablePreview: true },
}
