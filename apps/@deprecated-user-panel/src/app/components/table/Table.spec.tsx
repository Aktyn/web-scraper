import { render, screen } from '@testing-library/react'
import { Table } from './Table'
import { useTableColumns, type ColumnDefinition } from './useTableColumns'

describe(Table.name, () => {
  const mockData = [
    {
      id: 1,
      stringValue: 'mock-value-1',
      numberValue: 111,
    },
  ]

  const mockColumnsDefinitions: ColumnDefinition<(typeof mockData)[number]>[] = [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
    },
    {
      id: 'stringValue',
      header: 'String value',
      accessor: (row) => row.stringValue,
    },
    {
      id: 'numberValue',
      header: 'Doubled number value',
      accessor: (row) => row.numberValue * 2,
    },
  ]

  const MockTable = () => {
    const columns = useTableColumns({ definitions: mockColumnsDefinitions })
    return <Table columns={columns} keyProperty="id" data={mockData} />
  }

  it('should generate simple table from given columns and data', () => {
    render(<MockTable />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('mock-value-1')).toBeInTheDocument()
    expect(screen.getByText('222')).toBeInTheDocument()
  })

  //TODO: test imperative handle
})
