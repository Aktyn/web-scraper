import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DataSourceColumnType } from '@web-scraper/common'
import { DataSourceForm } from './DataSourceForm'

const meta = {
  title: 'DataSource/DataSourceForm',
  component: DataSourceForm,
  parameters: { layout: 'centered' },
  args: {
    onSuccess: fn(),
  },
} satisfies Meta<typeof DataSourceForm>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: { dataSource: undefined },
}
export const Update: Story = {
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
  },
}
