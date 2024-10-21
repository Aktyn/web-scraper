import { useCallback } from 'react'
import { Box, Dialog, DialogContent, DialogTitle, type DialogProps } from '@mui/material'
import { type DataSourceItem, type DataSourceStructure } from '@web-scraper/common'
import { useDataSourceTableColumns } from '../../hooks/useDataSourceTableColumns'
import { Table } from '../table'

interface DataSourceRowsSelectDialogProps extends DialogProps {
  dataSource: DataSourceStructure
  selectedDataSourceIds?: DataSourceItem['id'][]
  onSelectItem: (item: DataSourceItem) => void
}

export const DataSourceRowsSelectDialog = ({
  dataSource,
  selectedDataSourceIds,
  onSelectItem,
  ...dialogProps
}: DataSourceRowsSelectDialogProps) => {
  const columns = useDataSourceTableColumns(dataSource.columns, 'id')

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return window.electronAPI.getDataSourceItems(request, dataSource.name)
    },
    [dataSource.name],
  )

  return (
    <Dialog {...dialogProps}>
      <DialogTitle color="text.secondary">Select rows</DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: '100%',
            alignSelf: 'stretch',
            alignItems: 'stretch',
            mx: '-1.5rem',
          }}
        >
          <Box sx={{ width: '100%', height: '100%' }}>
            <Table
              columns={columns}
              keyProperty="id"
              hideRefreshButton
              data={dataFetcher}
              selectedRowKeys={selectedDataSourceIds}
              onRowClick={onSelectItem}
              allowUnselect
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
