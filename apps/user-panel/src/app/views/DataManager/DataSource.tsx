import { useCallback, useRef, useState } from 'react'
import { DeleteSweepRounded, FileDownloadRounded, FileUploadRounded } from '@mui/icons-material'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'
import { type DataSourceItem, type DataSourceStructure } from '@web-scraper/common'
import {
  type ColumnDefinition,
  Table,
  type TableRef,
  useTableColumns,
} from 'src/app/components/table'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { ConfirmableButton } from '../../components/common/button/ConfirmableButton'
import { DataSourceColumnTypeIcon } from '../../components/dataSource/DataSourceColumnTypeIcon'
import { DataSourceItemForm } from '../../components/dataSource/DataSourceItemForm'
import { useApiRequest } from '../../hooks/useApiRequest'

interface DataSourceProps {
  dataSource: DataSourceStructure
}

export const DataSource = ({ dataSource }: DataSourceProps) => {
  const tableRef = useRef<TableRef>(null)
  const dataSourceItemDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteDataSourceItemRequest = useApiRequest(window.electronAPI.deleteDataSourceItem)
  const clearDataSourceRequest = useApiRequest(window.electronAPI.clearDataSourceItems)
  const exportDataSourceRequest = useApiRequest(window.electronAPI.exportDataSourceItems)
  const importDataSourceRequest = useApiRequest(window.electronAPI.importDataSourceItems)

  const columns = useTableColumns<DataSourceItem>({
    definitions: [
      {
        id: 'id',
        header: 'ID',
        accessor: 'id',
        cellSx: { width: '4rem' },
      },
      ...dataSource.columns.map(
        (column) =>
          ({
            id: column.name,
            header: (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                columnGap="0.25rem"
              >
                <DataSourceColumnTypeIcon type={column.type} sx={{ opacity: 0.5 }} />
                <Box>{column.name}</Box>
              </Stack>
            ),
            accessor: (item) =>
              item.data.find((entry) => entry.columnName === column.name)?.value?.toString() ??
              null,
          }) satisfies ColumnDefinition<DataSourceItem>,
      ),
    ],
  })

  const [dataSourceItemToDelete, setDataSourceItemToDelete] = useState<DataSourceItem | null>(null)
  const [dataSourceItemToEdit, setDataSourceItemToEdit] = useState<DataSourceItem | null>(null)
  const [openDataSourceItemDeleteDialog, setOpenDataSourceItemDeleteDialog] = useState(false)

  const handleDelete = useCallback((item: DataSourceItem) => {
    setDataSourceItemToDelete(item)
    setOpenDataSourceItemDeleteDialog(true)
  }, [])
  const deleteDataSourceItem = useCallback(() => {
    if (!dataSourceItemToDelete) {
      return
    }
    deleteDataSourceItemRequest.submit(
      {
        onSuccess: (_res, { enqueueSnackbar }) => {
          setOpenDataSourceItemDeleteDialog(false)
          tableRef.current?.refresh()
          enqueueSnackbar({ variant: 'success', message: 'Data source item deleted successfully' })
        },
      },
      dataSource.name,
      dataSourceItemToDelete.id,
    )
  }, [dataSource.name, dataSourceItemToDelete, deleteDataSourceItemRequest])

  const handleAdd = useCallback(() => {
    setDataSourceItemToEdit(null)
    dataSourceItemDrawerRef.current?.open()
  }, [])
  const handleEdit = useCallback((item: DataSourceItem) => {
    setDataSourceItemToEdit(item)
    dataSourceItemDrawerRef.current?.open()
  }, [])
  const handleSuccess = useCallback(() => {
    dataSourceItemDrawerRef.current?.close()
    tableRef.current?.refresh()
  }, [])

  const exportDataSource = useCallback(() => {
    exportDataSourceRequest.submit(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
          enqueueSnackbar({
            variant: 'success',
            message: `${res.exportedRowsCount} rows has been exported`,
          })
        },
      },
      dataSource.name,
    )
  }, [dataSource.name, exportDataSourceRequest])

  const importDataSource = useCallback(() => {
    importDataSourceRequest.submit(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
          tableRef.current?.refresh()
          enqueueSnackbar({
            variant: res.importedRowsCount > 0 ? 'success' : 'info',
            message: `${res.importedRowsCount} rows has been imported (${res.failedRowsCount} failed)`,
          })
        },
      },
      dataSource.name,
    )
  }, [dataSource.name, importDataSourceRequest])

  const clearDataSource = useCallback(() => {
    clearDataSourceRequest.submit(
      {
        onSuccess: (_res, { enqueueSnackbar }) => {
          tableRef.current?.refresh()
          enqueueSnackbar({ variant: 'success', message: 'Data source has been cleared' })
        },
      },
      dataSource.name,
    )
  }, [clearDataSourceRequest, dataSource.name])

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return window.electronAPI.getDataSourceItems(request, dataSource.name)
    },
    [dataSource.name],
  )

  return (
    <>
      <CustomDrawer
        ref={dataSourceItemDrawerRef}
        title={`${dataSourceItemToEdit ? 'Edit' : 'Add'} data source item`}
      >
        <DataSourceItemForm
          dataSource={dataSource}
          dataSourceItem={dataSourceItemToEdit}
          onSuccess={handleSuccess}
        />
      </CustomDrawer>
      <ConfirmationDialog
        open={openDataSourceItemDeleteDialog}
        onClose={() => setOpenDataSourceItemDeleteDialog(false)}
        onConfirm={deleteDataSourceItem}
        loading={deleteDataSourceItemRequest.submitting}
        titleContent="Confirm action"
        confirmButtonText="Delete"
      >
        Are you sure you want to delete this data source entry?
      </ConfirmationDialog>
      <ViewTransition type={TransitionType.FADE}>
        <Box sx={{ height: '100%' }}>
          <Table
            ref={tableRef}
            columns={columns}
            keyProperty="id"
            data={dataFetcher}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            headerContent={
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                columnGap="0.5rem"
              >
                <Tooltip title="Export data source to JSON file">
                  <IconButton onClick={exportDataSource}>
                    <FileDownloadRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Import data from JSON file">
                  <IconButton onClick={importDataSource}>
                    <FileUploadRounded />
                  </IconButton>
                </Tooltip>
                <ConfirmableButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  endIcon={<DeleteSweepRounded />}
                  onConfirm={clearDataSource}
                >
                  Clear data source
                </ConfirmableButton>
              </Stack>
            }
          />
        </Box>
      </ViewTransition>
    </>
  )
}
