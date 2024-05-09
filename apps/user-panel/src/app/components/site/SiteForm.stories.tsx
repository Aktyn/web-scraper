import { Drawer } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SiteForm } from './SiteForm'

const meta = {
  title: 'Site/SiteForm',
  component: SiteForm,
  decorators: [
    (Story) => (
      <Drawer anchor="right" open>
        {/* TODO */}
        {/* <CustomDrawer ref={siteDrawerRef} title={siteToEdit ? 'Update site' : 'Add site'}> */}
        <Story />
      </Drawer>
    ),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    site: null,
    onSuccess: fn(),
  },
} satisfies Meta<typeof SiteForm>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {}
export const Update: Story = {
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
