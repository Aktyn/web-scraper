import { useMemo, type DependencyList, type ReactNode } from 'react'
import type { TableCellProps } from '@mui/material'
import type { Path } from '@web-scraper/common'

export interface ColumnDefinition<DataType> {
  /** Unique key for the column */
  id: string
  header: ReactNode
  accessor: (string & Path<DataType>) | ((row: DataType) => string | ReactNode)
  encrypted?: boolean
  jsonString?: boolean
  cellSx?: TableCellProps['sx']
  // sortable?: boolean
  // filter?: (props: FilterPropsBase<any>) => ReactElement<FilterPropsBase<any>>
}

interface CustomActionDefinition<DataType> {
  /** Unique key for the action component */
  id: string
  accessor: (row: DataType) => string | ReactNode
}

export function useTableColumns<DataType extends object>(
  data: {
    definitions: ColumnDefinition<DataType>[]
    customActions?: CustomActionDefinition<DataType>[]
  },
  deps: DependencyList = [],
) {
  return useMemo(
    () => ({
      definitions: data.definitions,
      customActions: data.customActions ?? emptyArray,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  )
}

const emptyArray: never[] = []
