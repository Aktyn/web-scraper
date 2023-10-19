import { useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
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
import { DataSourceItemForm } from '../../components/dataSource/DataSourceItemForm'
import { useApiRequest } from '../../hooks/useApiRequest'

interface DataSourceProps {
  dataSource: DataSourceStructure
}

export const DataSource = ({ dataSource }: DataSourceProps) => {
  const tableRef = useRef<TableRef>(null)
  const dataSourceItemDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteDataSourceItemRequest = useApiRequest(window.electronAPI.deleteDataSourceItem)
  const columns = useTableColumns<DataSourceItem>({
    definitions: [
      {
        id: 'id',
        header: 'ID',
        accessor: 'id',
      },
      ...dataSource.columns.map(
        (column) =>
          ({
            id: column.name,
            header: column.name,
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
  const handleDeleteConfirm = useCallback(() => {
    if (!dataSourceItemToDelete) {
      return
    }
    deleteDataSourceItemRequest.submit(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
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

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return window.electronAPI.getDataSourceItems(request, dataSource.name)
    },
    [dataSource.name],
  )

  return (
    <>
      <CustomDrawer ref={dataSourceItemDrawerRef} title="Update data source item">
        <DataSourceItemForm
          dataSource={dataSource}
          dataSourceItem={dataSourceItemToEdit}
          onSuccess={handleSuccess}
        />
      </CustomDrawer>
      <ConfirmationDialog
        open={openDataSourceItemDeleteDialog}
        onClose={() => setOpenDataSourceItemDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
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
          />
        </Box>
      </ViewTransition>
    </>
  )
}
