import { type RefAttributes, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { Path, PaginatedApiResponse } from '@web-scrapper/common'
import { getDeepProperty } from './helpers'
import type { useTableColumns } from './useTableColumns'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { genericForwardRef, genericMemo } from '../../utils'

interface TableProps<DataType extends object> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty?: string & Path<DataType>
  columns: ReturnType<typeof useTableColumns<DataType>>
  data: DataType[] | (() => Promise<PaginatedApiResponse<DataType>>)
}

export interface TableRef {
  refresh?: () => void
}

export const Table = genericMemo(
  genericForwardRef(
    <DataType extends object>(
      { keyProperty, columns, data: dataSource }: TableProps<DataType> & RefAttributes<TableRef>,
      ref: RefAttributes<TableRef>['ref'],
    ) => {
      const cancellable = useCancellablePromise()

      const [data, setData] = useState<DataType[]>([])
      //TODO: visualize fetching data
      const [_fetchingData, setFetchingData] = useState(false)

      const fetchDataChunk = useCallback(() => {
        if (typeof dataSource !== 'function') {
          setData(dataSource)
          return
        }

        //TODO: generic sorting and filtering (custom sorting and filtering can be done by overriding api request before sending as prop to Table component)
        setFetchingData(true)
        cancellable(dataSource())
          .then((response) => {
            // console.log('Response:', response)
            if ('errorCode' in response) {
              // console.log('Error:', response)
              //TODO: handle error
              return
            }
            setData((data) => [...data, ...response.data])
          })
          .catch((error) => !error && setFetchingData(false))
      }, [cancellable, dataSource])

      useEffect(() => {
        fetchDataChunk()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dataSource])

      useImperativeHandle(
        ref,
        () => ({
          refresh: () => {
            setData([])
            fetchDataChunk()
          },
        }),
        [fetchDataChunk],
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
