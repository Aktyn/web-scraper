import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SiteTagForm } from './SiteTagForm'
import { CustomDrawer } from '../common/CustomDrawer'

const meta = {
  title: 'Site/SiteTagForm',
  component: SiteTagForm,
  decorators: [
    (Story) => (
      <CustomDrawer title="Site tag form" defaultOpen>
        <Story />
      </CustomDrawer>
    ),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    siteTag: {
      id: 2,
      name: 'Bar',
      description: 'Tag description',
    },
    siteUrl: 'http://example.com',
    onAssign: fn(),
    onUpdateSuccess: fn(),
  },
} satisfies Meta<typeof SiteTagForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
