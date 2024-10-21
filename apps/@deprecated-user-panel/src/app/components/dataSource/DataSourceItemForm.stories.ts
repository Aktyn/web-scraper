import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DataSourceColumnType } from '@web-scraper/common'
import { DataSourceItemForm } from './DataSourceItemForm'

const meta = {
  title: 'DataSource/DataSourceItemForm',
  component: DataSourceItemForm,
  parameters: { layout: 'centered' },
  args: {
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
    onSuccess: fn(),
  },
} satisfies Meta<typeof DataSourceItemForm>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: { dataSourceItem: null },
}
export const Update: Story = {
  args: {
    dataSourceItem: {
      id: 1,
      data: [
        {
          columnName: 'Integer column',
          value: 1337,
        },
        {
          columnName: 'Real column',
          value: null,
        },
        {
          columnName: 'Text column',
          value: 'Foo',
        },
      ],
    },
  },
}
