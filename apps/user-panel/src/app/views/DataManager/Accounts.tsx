import { Table, useTableColumns } from '../../components/table'

const mockData: { id: number; stringValue: string; numberValue: number }[] = new Array(100)
  .fill(0)
  .map((_, index) => ({
    id: index + 1,
    stringValue: `mock-value-${index + 1}`,
    numberValue: index + 1,
  }))

export const Accounts = () => {
  const columns = useTableColumns<(typeof mockData)[number]>([
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
  ])

  return <Table columns={columns} keyProperty="id" data={mockData} />
}
