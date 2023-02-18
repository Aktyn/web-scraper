import type { ReactNode } from 'react'
import type { Path } from '@web-scrapper/common'
import type { ColumnDefinition } from './useTableColumns'

export { Table } from './Table'
export { useTableColumns, type ColumnDefinition } from './useTableColumns'

export function generateColumn<DataType>(
  id: string,
  header: ReactNode,
  accessor: (string & Path<DataType>) | ((row: DataType) => ReactNode),
): ColumnDefinition<DataType> {
  return {
    id,
    header,
    accessor,
  }
}
