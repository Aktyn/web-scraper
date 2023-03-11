import {
  type RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { AddRounded, RefreshRounded } from '@mui/icons-material'
import {
  IconButton,
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  type ExtractTypeByPath,
  getDeepProperty,
  type PaginatedApiFunction,
  type Path,
} from '@web-scrapper/common'
import { useSnackbar } from 'notistack'
import { ValueCell } from './ValueCell'
import type { useTableColumns } from './useTableColumns'
import { Config } from '../../config'
import { UserDataContext } from '../../context/userDataContext'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { errorMessages, genericForwardRef, genericMemo } from '../../utils'
import { LoadingIconButton } from '../common/button/LoadingIconButton'

interface TableProps<DataType extends object, KeyPropertyType extends string & Path<DataType>> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty: ExtractTypeByPath<DataType, KeyPropertyType> extends string | number
    ? KeyPropertyType
    : never
  columns: ReturnType<typeof useTableColumns<DataType>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: DataType[] | PaginatedApiFunction<DataType, any>
  onAdd?: () => void
}

export interface TableRef {
  refresh: () => void
}

export const Table = genericMemo(
  genericForwardRef(
    <DataType extends object, KeyPropertyType extends string & Path<DataType>>(
      {
        keyProperty,
        columns,
        data: dataSource,
        onAdd,
      }: TableProps<DataType, KeyPropertyType> & RefAttributes<TableRef>,
      ref: RefAttributes<TableRef>['ref'],
    ) => {
      const cancellable = useCancellablePromise()
      const tableContainerRef = useRef<HTMLDivElement>(null)

      const { enqueueSnackbar } = useSnackbar()
      const { settings } = useContext(UserDataContext)

      const [data, setData] = useState<DataType[]>([])
      const [cursor, setCursor] = useState<{ [p: string]: unknown } | undefined | null>(null)
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
              if ('errorCode' in response) {
                enqueueSnackbar({ variant: 'error', message: errorMessages[response.errorCode] })
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
        [cancellable, cursor, dataSource, enqueueSnackbar, keyProperty],
      )

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

      useEffect(() => {
        refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dataSource])

      useImperativeHandle(
        ref,
        () => ({
          refresh,
        }),
        [refresh],
      )

      return (
        <TableContainer ref={tableContainerRef} sx={{ maxHeight: '100%' }}>
          <MuiTable stickyHeader size={settings.tablesCompactMode ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell colSpan={columns.definitions.length} align="right" sx={{ p: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1}>
                    <LoadingIconButton loading={fetchingData} onClick={refresh} size="small">
                      <RefreshRounded />
                    </LoadingIconButton>
                    {onAdd && (
                      <IconButton onClick={onAdd} size="small">
                        <AddRounded />
                      </IconButton>
                    )}
                  </Stack>
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
                <TableRow
                  key={keyProperty ? (getDeepProperty(row, keyProperty) as never) : rowIndex}
                >
                  {columns.definitions.map((columnDefinition) => (
                    <ValueCell
                      key={columnDefinition.id}
                      encrypted={!!columnDefinition.encrypted}
                      jsonString={!!columnDefinition.jsonString}
                    >
                      {typeof columnDefinition.accessor === 'function'
                        ? columnDefinition.accessor(row)
                        : getDeepProperty(row, columnDefinition.accessor)}
                    </ValueCell>
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
