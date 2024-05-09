import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DataSourceColumnType } from '@web-scraper/common'
import { DataSourceRowsSelectDialog } from './DataSourceRowsSelectDialog'

const meta = {
  title: 'DataSource/DataSourceRowsSelectDialog',
  component: DataSourceRowsSelectDialog,
  parameters: { layout: 'centered' },
  args: {
    open: true,
    onClose: fn(),
    dataSource: {
      name: 'Data source name',
      columns: [
        {
          name: 'Integer column',
          type: DataSourceColumnType.INTEGER,
        },
        {
          name: 'Real column',
          type: DataSourceColumnType.REAL,
        },
        {
          name: 'Text column',
          type: DataSourceColumnType.TEXT,
        },
      ],
    },
    onSelectItem: fn(),
  },
} satisfies Meta<typeof DataSourceRowsSelectDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithSelectedRows: Story = {
  args: { selectedDataSourceIds: [2, 4] },
}
