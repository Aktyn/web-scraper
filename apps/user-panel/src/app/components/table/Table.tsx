import { type RefAttributes, useImperativeHandle } from 'react'
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { Path } from '@web-scrapper/common'
import { getDeepProperty } from './helpers'
import type { useTableColumns } from './useTableColumns'
import { genericForwardRef, genericMemo } from '../../utils'

interface TableProps<DataType extends object> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty?: string & Path<DataType>
  columns: ReturnType<typeof useTableColumns<DataType>>
  data: DataType[] //TODO: dynamic loading data ((next?: IdType) => Promise<Data[]>)
}

export interface TableRef {
  refresh?: () => void
}

export const Table = genericMemo(
  genericForwardRef(
    <DataType extends object>(
      { keyProperty, columns, data }: TableProps<DataType> & RefAttributes<TableRef>,
      ref: RefAttributes<TableRef>['ref'],
    ) => {
      useImperativeHandle(
        ref,
        () => ({
          refresh: () => {
            //TODO
          },
        }),
        [],
      )

      return (
        <TableContainer sx={{ maxHeight: '100%' }}>
          <MuiTable stickyHeader>
            <TableHead>
              <TableRow>
                {columns.definitions.map((columnDefinition) => (
                  <TableCell key={columnDefinition.id}>{columnDefinition.header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={keyProperty ? getDeepProperty(row, keyProperty) : rowIndex}>
                  {columns.definitions.map((columnDefinition) => (
                    <TableCell key={columnDefinition.id}>
                      {typeof columnDefinition.accessor === 'function'
                        ? columnDefinition.accessor(row)
                        : getDeepProperty(row, columnDefinition.accessor)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )
    },
  ),
)
