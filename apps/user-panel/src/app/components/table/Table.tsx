import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Key,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  ExpandMoreRounded,
  RefreshRounded,
} from '@mui/icons-material'
import {
  Box,
  Collapse,
  IconButton,
  Table as MuiTable,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  chipClasses,
} from '@mui/material'
import {
  getDeepProperty,
  type ExtractTypeByPath,
  type PaginatedApiFunction,
  type Path,
} from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { ValueCell } from './ValueCell'
import type { useTableColumns } from './useTableColumns'
import { Config } from '../../config'
import { UserDataContext } from '../../context/userDataContext'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { usePersistentState } from '../../hooks/usePersistentState'
import { errorLabels, genericForwardRef, genericMemo } from '../../utils'
import { LoadingIconButton } from '../common/button/LoadingIconButton'

interface TableProps<DataType extends object, KeyPropertyType extends string & Path<DataType>>
  extends Omit<
    RowProps<DataType>,
    'selected' | 'row' | 'hasActionsColumn' | 'mainTableHeaderSize'
  > {
  /** Used for caching data */
  name?: string | null
  /** Property name with unique values for each row. Used as a key prop for react rows. */
  keyProperty: ExtractTypeByPath<DataType, KeyPropertyType> extends string | number
    ? KeyPropertyType
    : never
  headerContent?: ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: DataType[] | PaginatedApiFunction<DataType, any, never, any[]>
  onAdd?: ReactNode | (() => void)
  selectedRowKeys?: ExtractTypeByPath<DataType, KeyPropertyType>[]
  hideRefreshButton?: boolean
}

export interface TableRef {
  refresh: () => void
}

export const Table = genericMemo(
  genericForwardRef(
    <DataType extends object, KeyPropertyType extends string & Path<DataType>>(
      {
        name = null,
        keyProperty,
        columns,
        headerContent,
        data: dataSource,
        onAdd,
        selectedRowKeys = emptyArray,
        hideRefreshButton,
        ...rowProps
      }: TableProps<DataType, KeyPropertyType> & RefAttributes<TableRef>,
      ref: Ref<TableRef>,
    ) => {
      const cancellable = useCancellablePromise()
      const tableContainerRef = useRef<HTMLDivElement>(null)

      const { enqueueSnackbar } = useSnackbar()
      const { settings } = useContext(UserDataContext)

      const [data, setData] = usePersistentState<DataType[]>(name, [])
      const [cursor, setCursor] = useState<{ [p: string]: unknown } | undefined | null>(null)
      const [fetchingData, setFetchingData] = useState(false)

      const hasActionsColumn =
        !!rowProps.onDelete ||
        !!rowProps.onEdit ||
        !!rowProps.onRowExpand ||
        columns.customActions.length > 0
      const columnsCount = columns.definitions.length + (hasActionsColumn ? 1 : 0)
      const showMainHeader = Boolean(!hideRefreshButton || headerContent || onAdd)
      const mainTableHeaderSize = showMainHeader ? 51 : 0

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
                enqueueSnackbar({ variant: 'error', message: errorLabels[response.errorCode] })
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
            .catch((error) => error && setFetchingData(false))
        },
        [cancellable, cursor, dataSource, enqueueSnackbar, keyProperty, setData],
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
            {showMainHeader && (
              <TableHead>
                <TableRow>
                  <TableCell colSpan={columnsCount} align="right" sx={{ p: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap="0.5rem"
                    >
                      {headerContent}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap="0.5rem"
                        ml="auto"
                        position="sticky"
                        right="0.5rem"
                      >
                        {!hideRefreshButton && (
                          <LoadingIconButton loading={fetchingData} onClick={refresh} size="small">
                            <RefreshRounded />
                          </LoadingIconButton>
                        )}
                        {onAdd &&
                          (typeof onAdd === 'function' ? (
                            <IconButton onClick={onAdd} size="small">
                              <AddRounded />
                            </IconButton>
                          ) : (
                            onAdd
                          ))}
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>
            )}
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
                data.map((row, rowIndex) => {
                  const key = keyProperty
                    ? (getDeepProperty(row, keyProperty) as ExtractTypeByPath<
                        DataType,
                        KeyPropertyType
                      >)
                    : undefined

                  const selected = !!key && selectedRowKeys?.includes(key)

                  return (
                    <Row
                      key={(key as Key) ?? rowIndex}
                      row={row}
                      selected={selected}
                      hasActionsColumn={hasActionsColumn}
                      mainTableHeaderSize={mainTableHeaderSize}
                      columns={columns}
                      {...rowProps}
                    />
                  )
                })
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

interface RowProps<DataType extends object> {
  row: DataType
  selected: boolean
  hasActionsColumn: boolean
  mainTableHeaderSize: number

  columns: ReturnType<typeof useTableColumns<DataType>>
  onEdit?: (data: DataType) => void
  onDelete?: (data: DataType) => void
  onRowClick?: (row: DataType) => void
  onRowExpand?: (row: DataType) => ReactNode
  expandButtonTooltip?: ReactNode
  expandOnRowClick?: boolean
  allowUnselect?: boolean
}

const Row = <DataType extends object>({
  row,
  selected,
  hasActionsColumn,
  mainTableHeaderSize,
  columns,
  onEdit,
  onDelete,
  onRowClick,
  onRowExpand,
  expandButtonTooltip,
  expandOnRowClick,
  allowUnselect,
}: RowProps<DataType>) => {
  const columnsCount = columns.definitions.length + (hasActionsColumn ? 1 : 0)

  const [rowExpandContent, setRowExpandContent] = useState<ReactNode>(null)
  const [expandRow, setExpandRow] = useState(false)

  const handleRowExpandClick = useCallback<MouseEventHandler<HTMLElement>>(
    (event) => {
      const content = onRowExpand?.(row)
      setRowExpandContent(content)
      setExpandRow((current) => !current && content !== null && content !== undefined)

      event.preventDefault()
      event.stopPropagation()
    },
    [onRowExpand, row],
  )

  const handleRegularRowClick = useCallback<MouseEventHandler<HTMLElement>>(() => {
    onRowClick?.(row)
  }, [onRowClick, row])

  const onRowClickCallback = expandOnRowClick ? handleRowExpandClick : handleRegularRowClick
  const clickable = (expandOnRowClick || !!onRowClick) && (!selected || allowUnselect)

  return (
    <>
      <TableRow
        hover={clickable}
        onClick={clickable ? onRowClickCallback : undefined}
        sx={{
          cursor: clickable ? 'pointer' : undefined,
          backgroundColor: selected
            ? (theme) => `${alpha(theme.palette.action.focus, 0.75)} !important`
            : undefined,
          [`& .${chipClasses.root}.no-data-chip`]: selected
            ? {
                color: 'text.primary',
              }
            : undefined,
        }}
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
            <Stack direction="row" alignItems="center" justifyContent="end-start" gap="0.5rem">
              {columns.customActions.map((customAction) => (
                <Box key={customAction.id}>{customAction.accessor(row)}</Box>
              ))}
              {onEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(row)}>
                    <EditRounded />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => onDelete(row)}>
                    <DeleteRounded />
                  </IconButton>
                </Tooltip>
              )}
              {onRowExpand && (
                <Tooltip title={expandRow ? 'Collapse' : expandButtonTooltip ?? 'Expand'}>
                  <IconButton size="small" onClick={handleRowExpandClick}>
                    <ExpandMoreRounded
                      sx={{
                        transform: `rotate(${expandRow ? 180 : 0}deg)`,
                        transition: (theme) => theme.transitions.create('transform'),
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        )}
      </TableRow>
      {onRowExpand && (
        <>
          <TableRow />
          <TableRow>
            <TableCell
              style={{ padding: 0, border: expandRow ? undefined : 'none' }}
              colSpan={columnsCount}
            >
              <Collapse in={expandRow} timeout="auto" unmountOnExit>
                {rowExpandContent}
              </Collapse>
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  )
}

const emptyArray: never[] = []
