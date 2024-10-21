import type { Meta, StoryObj } from '@storybook/react'
import { TabsView } from './TabsView'

const meta = {
  title: 'Common/TabsView',
  component: TabsView,
  parameters: { layout: 'fullscreen' },
  args: {
    name: 'TabsView-story',
    tabs: [
      { value: 1, label: 'First tab', content: 'First tab content' },
      { value: 2, label: 'Second tab', content: 'Second tab content' },
      { value: 3, label: 'Third tab', content: 'Third tab content' },
    ],
    defaultTab: 1,
    height: '100vh',
  },
} satisfies Meta<typeof TabsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
