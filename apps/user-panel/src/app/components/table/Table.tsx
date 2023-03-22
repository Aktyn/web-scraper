import {
  type ReactNode,
  type RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { AddRounded, DeleteRounded, EditRounded, RefreshRounded } from '@mui/icons-material'
import {
  IconButton,
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
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
import { errorHelpers, genericForwardRef, genericMemo } from '../../utils'
import { LoadingIconButton } from '../common/button/LoadingIconButton'

interface TableProps<DataType extends object, KeyPropertyType extends string & Path<DataType>> {
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty: ExtractTypeByPath<DataType, KeyPropertyType> extends string | number
    ? KeyPropertyType
    : never
  columns: ReturnType<typeof useTableColumns<DataType>>
  headerContent?: ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: DataType[] | PaginatedApiFunction<DataType, any>
  onAdd?: () => void
  onEdit?: (data: DataType) => void
  onDelete?: (data: DataType) => void
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
        headerContent,
        data: dataSource,
        onAdd,
        onEdit,
        onDelete,
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
      const hasActionsColumn = !!onDelete || !!onEdit
      const columnsCount = columns.definitions.length + (hasActionsColumn ? 1 : 0)

      const fetchDataChunk = useCallback(
        (withCursor = cursor, replace = false) => {
          if (typeof dataSource !== 'function') {
            setData(dataSource)
            return
          }

          setFetchingData(true)
          cancellable(
            dataSource({
              count: Config.PAGINATION_PAGE_SIZE,
              cursor: withCursor ?? undefined,
              filters: [],
            }),
          )
            .then((response) => {
              if ('errorCode' in response) {
                enqueueSnackbar({ variant: 'error', message: errorHelpers[response.errorCode] })
                return
              }
              setData((data) => {
                if (replace) {
                  return response.data
                }

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
        fetchDataChunk(null, true)
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
                <TableCell colSpan={columnsCount} align="right" sx={{ p: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    {headerContent}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={1}
                      ml="auto"
                    >
                      <LoadingIconButton loading={fetchingData} onClick={refresh} size="small">
                        <RefreshRounded />
                      </LoadingIconButton>
                      {onAdd && (
                        <IconButton onClick={onAdd} size="small">
                          <AddRounded />
                        </IconButton>
                      )}
                    </Stack>
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
                {hasActionsColumn && <TableCell sx={{ top: mainTableHeaderSize }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length ? (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={keyProperty ? (getDeepProperty(row, keyProperty) as never) : rowIndex}
                  >
                    {columns.definitions.map((columnDefinition) => (
                      <ValueCell
                        key={columnDefinition.id}
                        encrypted={!!columnDefinition.encrypted}
                        jsonString={!!columnDefinition.jsonString}
                        sx={columnDefinition.cellSx}
                      >
                        {typeof columnDefinition.accessor === 'function'
                          ? columnDefinition.accessor(row)
                          : getDeepProperty(row, columnDefinition.accessor)}
                      </ValueCell>
                    ))}
                    {hasActionsColumn && (
                      <TableCell width="2.5rem" sx={{ top: mainTableHeaderSize, py: 0 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="end-start"
                          gap={1}
                        >
                          {onEdit && (
                            <Tooltip title="Edit" disableInteractive>
                              <IconButton size="small" onClick={() => onEdit(row)}>
                                <EditRounded />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete" disableInteractive>
                              <IconButton size="small" onClick={() => onDelete(row)}>
                                <DeleteRounded />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnsCount} align="center" sx={{ py: 2 }}>
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                      No data
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )
    },
  ),
)
