import { SourceRounded } from '@mui/icons-material'
import { Box, Stack, Tooltip } from '@mui/material'
import { type DataSourceStructure, type DataSourceItem } from '@web-scraper/common'
import { DataSourceColumnTypeIcon } from '../components/dataSource/DataSourceColumnTypeIcon'
import { useTableColumns, type ColumnDefinition } from '../components/table'

export function useDataSourceTableColumns(
  columns?: DataSourceStructure['columns'],
  targetColumnName?: string,
) {
  return useTableColumns<DataSourceItem>(
    {
      definitions: [
        {
          id: 'id',
          header: 'ID',
          accessor: 'id',
          cellSx: { width: '4rem' },
        },
        ...(columns ?? []).map(
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
    [columns],
  )
}
