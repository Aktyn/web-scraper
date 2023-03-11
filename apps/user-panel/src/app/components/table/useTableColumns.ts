import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { Path } from '@web-scrapper/common'

export interface ColumnDefinition<DataType> {
  /** Unique key for the column */
  id: string
  header: ReactNode
  accessor: (string & Path<DataType>) | ((row: DataType) => string | ReactNode)
  encrypted?: boolean
  jsonString?: boolean
  // width?: number
  // sortable?: boolean
  // filter?: (props: FilterPropsBase<any>) => React.ReactElement<FilterPropsBase<any>>
}

export function useTableColumns<DataType extends object>(
  columnsDefinitions: ColumnDefinition<DataType>[],
) {
  return useMemo(
    () => ({
      definitions: columnsDefinitions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
