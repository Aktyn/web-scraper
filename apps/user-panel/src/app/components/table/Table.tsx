import {
  type RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { RefreshRounded } from '@mui/icons-material'
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { PaginatedApiFunction, Path } from '@web-scrapper/common'
import { getDeepProperty } from './helpers'
import type { useTableColumns } from './useTableColumns'
import { Config } from '../../config'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { genericForwardRef, genericMemo } from '../../utils'
import { LoadingIconButton } from '../common/button/LoadingIconButton'

interface TableProps<DataType extends object> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty: string & Path<DataType>
  columns: ReturnType<typeof useTableColumns<DataType>>
  // eslint-disable-next-line
  data: DataType[] | PaginatedApiFunction<DataType, any>
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
      const tableContainerRef = useRef<HTMLDivElement>(null)
      const cancellable = useCancellablePromise()

      const [data, setData] = useState<DataType[]>([])
      const [cursor, setCursor] = useState<{ [p: string]: unknown } | undefined | null>(null)
      // const [scrollTop, setScrollTop] = useState(0)
      //TODO: visualize fetching data
      const [fetchingData, setFetchingData] = useState(false)

      const mainTableHeaderSize = 51

      const fetchDataChunk = useCallback(
        (withCursor = cursor) => {
          if (typeof dataSource !== 'function') {
            setData(dataSource)
            return
          }

          //TODO: generic sorting and filtering (custom sorting and filtering can be done by overriding api request before sending as prop to Table component)
          // eslint-disable-next-line no-console
          console.log('Fetching data')
          setFetchingData(true)
          cancellable(
            dataSource({ count: Config.PAGINATION_PAGE_SIZE, cursor: withCursor ?? undefined }),
          )
            .then((response) => {
              // console.log('Response:', response)
              if ('errorCode' in response) {
                // console.log('Error:', response)
                //TODO: handle error
                return
              }
              setData((data) => {
                const lastDataItem = data.at(-1)
                const lastResponseDataItem = response.data.at(-1)

                if (
                  !response.data.length ||
                  (lastDataItem &&
                    lastResponseDataItem &&
                    getDeepProperty(lastDataItem, keyProperty) ===
                      getDeepProperty(lastResponseDataItem, keyProperty))
                ) {
                  return data
                }

                return [...data, ...response.data]
              })
              setCursor(response.cursor)
              setFetchingData(false)
            })
            .catch((error) => !error && setFetchingData(false))
        },
        [cancellable, cursor, dataSource, keyProperty],
      )

      useEffect(() => {
        fetchDataChunk(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dataSource])

      useEffect(() => {
        const container = tableContainerRef.current
        if (!container || !cursor || fetchingData) {
          return
        }

        const table = container.querySelector('table')
        if (!table) {
          return
        }

        const offset = 256

        const autoFetch = () => {
          if (
            container.getBoundingClientRect().height + container.scrollTop <
            table.getBoundingClientRect().height - offset
          ) {
            return
          }

          fetchDataChunk(cursor)
        }

        autoFetch()
        container.addEventListener('scroll', autoFetch)

        return () => {
          container.removeEventListener('scroll', autoFetch)
        }
      }, [cursor, fetchDataChunk, fetchingData])

      const refresh = useCallback(() => {
        setCursor(undefined)
        setData([])
        fetchDataChunk(null)
      }, [fetchDataChunk])

      useImperativeHandle(
        ref,
        () => ({
          refresh,
        }),
        [refresh],
      )

      return (
        <TableContainer
          ref={tableContainerRef}
          // onScroll={(event) => {
          //   setScrollTop((event.target as HTMLDivElement).scrollTop)
          // }}
          sx={{ maxHeight: '100%' }}
        >
          <MuiTable stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell colSpan={columns.definitions.length} align="right" sx={{ p: 1 }}>
                  <LoadingIconButton loading={fetchingData} onClick={refresh} size="small">
                    <RefreshRounded />
                  </LoadingIconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableHead>
              <TableRow>
                {columns.definitions.map((columnDefinition) => (
                  <TableCell key={columnDefinition.id} sx={{ top: mainTableHeaderSize }}>
                    {columnDefinition.header}
                  </TableCell>
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
