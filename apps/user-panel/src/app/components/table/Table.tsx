import { forwardRef, memo, type RefAttributes, useImperativeHandle } from 'react'
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

const genericMemo: <T>(component: T) => T = memo
const genericForwardRef: <T>(component: T) => T = forwardRef as never

interface TableProps<DataType extends object> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty?: string & Path<DataType>
  columns: ReturnType<typeof useTableColumns<DataType>>
  data: DataType[] //TODO: dynamic loading data ((next?: IdType) => Promise<Data[]>)
}

export interface TableRef {
  //TODO
  // setPage?: React.Dispatch<React.SetStateAction<number>>;
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
          // setPage,
          refresh: () => {
            //TODO
          },
        }),
        [],
      )

      return (
        <TableContainer>
          <MuiTable>
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
              {/*{rows.map((row) => (*/}
              {/*  <TableRow*/}
              {/*    key={row.name}*/}
              {/*    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}*/}
              {/*  >*/}
              {/*    <TableCell component="th" scope="row">*/}
              {/*      {row.name}*/}
              {/*    </TableCell>*/}
              {/*    <TableCell align="right">{row.calories}</TableCell>*/}
              {/*    <TableCell align="right">{row.fat}</TableCell>*/}
              {/*    <TableCell align="right">{row.carbs}</TableCell>*/}
              {/*    <TableCell align="right">{row.protein}</TableCell>*/}
              {/*  </TableRow>*/}
              {/*))}*/}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )
    },
  ),
)
