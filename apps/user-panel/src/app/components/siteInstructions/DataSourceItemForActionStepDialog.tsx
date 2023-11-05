import { useCallback, useEffect, useMemo, useState } from 'react'
import { SendRounded, SourceRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  type ActionStep,
  type ApiError,
  type DataSourceItem,
  dataSourceQueryRegex,
  type DataSourceValueQuery,
  ElectronToRendererMessage,
  ErrorCode,
} from '@web-scraper/common'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { actionStepTypeNames } from '../../utils/dictionaries'
import { LabeledValuesList } from '../common/LabeledValuesList'
import { DataSourceColumnTypeIcon } from '../dataSource/DataSourceColumnTypeIcon'
import { type ColumnDefinition, Table, useTableColumns } from '../table'

interface DataSchema {
  requestId: string
  actionStep: ActionStep
  dataSourceQuery: DataSourceValueQuery
}

type DataSourceItemForActionStepDialogProps = Omit<DialogProps, 'onClose'> & {
  onResponseSent: (data: DataSchema) => void
  data?: DataSchema
}

export function DataSourceItemForActionStepDialog({
  onResponseSent,
  data,
  ...dialogProps
}: DataSourceItemForActionStepDialogProps) {
  const {
    submit: submitReturnDataSourceItemIdForActionStep,
    submitting: submittingReturnDataSourceItemIdForActionStep,
  } = useApiRequest(window.electronAPI.returnDataSourceItemIdForActionStep)

  const { loadDataSources, dataSources, loadingDataSources } = useDataSourcesLoader()

  const [selectedDataSourceItem, setSelectedDataSourceItem] = useState<DataSourceItem | null>(null)

  const selectedDataSourceIds = useMemo(
    () => (selectedDataSourceItem ? [selectedDataSourceItem.id] : []),
    [selectedDataSourceItem],
  )

  useEffect(() => {
    void loadDataSources()
  }, [loadDataSources])

  const [dataSourceFromData, targetColumnName] = useMemo(() => {
    if (!data?.dataSourceQuery?.match(dataSourceQueryRegex)) {
      return [null, null]
    }

    const [, dataSourceName, columnName] = data.dataSourceQuery.split('.') ?? ['', '', '']

    const dataSource = (dataSources ?? []).find(({ name }) => name === dataSourceName)
    if (!dataSource) {
      return [null, null]
    }

    return [dataSource, columnName]
  }, [data?.dataSourceQuery, dataSources])

  const columns = useTableColumns<DataSourceItem>(
    {
      definitions: [
        {
          id: 'id',
          header: 'ID',
          accessor: 'id',
          cellSx: { width: '4rem' },
        },
        ...(dataSourceFromData?.columns ?? []).map(
          (column) =>
            ({
              id: column.name,
              header: (
                <Tooltip
                  title={column.name === targetColumnName ? 'Source column' : ''}
                  placement="bottom-start"
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-start"
                    columnGap="0.25rem"
                  >
                    {column.name === targetColumnName && <SourceRounded color="secondary" />}
                    <DataSourceColumnTypeIcon type={column.type} sx={{ opacity: 0.5 }} />
                    <Box>{column.name}</Box>
                  </Stack>
                </Tooltip>
              ),
              accessor: (item) =>
                item.data.find((entry) => entry.columnName === column.name)?.value?.toString() ??
                null,
            }) satisfies ColumnDefinition<DataSourceItem>,
        ),
      ],
    },
    [dataSourceFromData?.columns],
  )

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return dataSourceFromData?.name
        ? window.electronAPI.getDataSourceItems(request, dataSourceFromData.name)
        : Promise.resolve({ errorCode: ErrorCode.UNKNOWN_ERROR } as ApiError)
    },
    [dataSourceFromData?.name],
  )

  const handleSendData = useCallback(() => {
    if (!data || !selectedDataSourceItem?.id) {
      return
    }

    submitReturnDataSourceItemIdForActionStep(
      {
        onSuccess: (_, { enqueueSnackbar }) => {
          enqueueSnackbar({ variant: 'success', message: 'Data returned to continue action step' })
        },
        onEnd: () => onResponseSent(data),
      },
      ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
      data.requestId,
      selectedDataSourceItem?.id,
    )
  }, [data, onResponseSent, selectedDataSourceItem?.id, submitReturnDataSourceItemIdForActionStep])

  return (
    <Dialog {...dialogProps}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" pr="1.5rem">
        <DialogTitle color="text.secondary">
          Action step requires data source row to continue
        </DialogTitle>
      </Stack>
      <DialogContent sx={{ pt: 0 }}>
        <Stack alignItems="center" rowGap={1}>
          <LabeledValuesList
            data={[
              {
                label: 'Action step',
                value: data ? actionStepTypeNames[data.actionStep.type] : '-',
              },
              {
                label: 'Data source query',
                value: data?.dataSourceQuery ?? '-',
              },
            ]}
          />
          <DialogContentText color="text.primary" whiteSpace="pre-wrap">
            Select row to update column <strong>{targetColumnName}</strong>
          </DialogContentText>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: '100%',
              alignSelf: 'stretch',
              alignItems: 'stretch',
              maxHeight: '22rem',
              mx: '-1.5rem',
            }}
          >
            {loadingDataSources ? (
              <CircularProgress color="primary" size="2rem" sx={{ mx: 'auto' }} />
            ) : (
              dataSourceFromData && (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Table
                    columns={columns}
                    keyProperty="id"
                    hideRefreshButton
                    data={dataFetcher}
                    selectedRowKeys={selectedDataSourceIds}
                    onRowClick={setSelectedDataSourceItem}
                  />
                </Box>
              )
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="outlined"
          color="primary"
          onClick={handleSendData}
          disabled={!selectedDataSourceItem}
          endIcon={<SendRounded />}
          loading={submittingReturnDataSourceItemIdForActionStep}
          loadingPosition="end"
        >
          Send
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
