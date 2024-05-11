import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Table } from './Table'
import type { ColumnDefinition } from './useTableColumns'

const mockData = [
  { id: 1, name: 'Foo', description: 'Foo description', booleanColumn: true },
  { id: 2, name: 'Bar', description: 'Bar description', booleanColumn: false },
  { id: 3, name: 'No description', description: null, booleanColumn: true },
]

const meta = {
  title: 'Table',
  component: Table,
  parameters: { layout: 'fullscreen' },
  args: {
    data: mockData,
    keyProperty: 'id' as never,
    columns: {
      definitions: [
        {
          id: 'id',
          header: 'ID',
          accessor: 'id' as never,
          cellSx: { width: '4rem' },
        },
        {
          id: 'name',
          header: 'Name',
          accessor: 'name' as never,
        },
        {
          id: 'description',
          header: 'Description',
          accessor: 'description' as never,
        },
        {
          id: 'booleanColumn',
          header: 'Boolean',
          accessor: 'booleanColumn' as never,
        },
      ] satisfies ColumnDefinition<(typeof mockData)[0]>[],
      customActions: [],
    },
    hideRefreshButton: false,
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const HeaderContent: Story = {
  args: { headerContent: 'Header content' },
}
export const WithActions: Story = {
  args: { onAdd: fn(), onDelete: fn(), onEdit: fn(), onRowClick: fn() },
}
