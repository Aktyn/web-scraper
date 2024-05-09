import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SiteSelectForm } from './SiteSelectForm'

const meta = {
  title: 'Site/SiteSelectForm',
  component: SiteSelectForm,
  parameters: { layout: 'centered' },
  args: {
    site: null,
    onSelect: fn(),
  },
} satisfies Meta<typeof SiteSelectForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = {
  args: {
    site: {
      id: 1,
      createdAt: new Date(1715164444961),
      url: 'http://example.com',
      language: 'en',
      tags: [
        {
          id: 1,
          name: 'Foo',
          description: null,
        },
      ],
    },
  },
}
