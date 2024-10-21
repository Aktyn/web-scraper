import { useCallback, useContext, useState } from 'react'
import { Box, FormControlLabel, Switch } from '@mui/material'
import { RoutineExecutionType, dataSourceFiltersToSqlite, type Routine } from '@web-scraper/common'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourceTableColumns } from '../../hooks/useDataSourceTableColumns'
import { Table } from '../table'

interface ExecutionPlanRowsPreviewProps {
  executionPlan: Routine['executionPlan'] & { type: Exclude<RoutineExecutionType, 'standalone'> }
}

export const ExecutionPlanRowsPreview = ({ executionPlan }: ExecutionPlanRowsPreviewProps) => {
  const dataSources = useContext(DataSourcesContext)
  const dataSourceStructure = dataSources.find(
    (dataSource) => dataSource.name === executionPlan.dataSourceName,
  )

  const columns = useDataSourceTableColumns(dataSourceStructure?.columns, 'id')

  const [disableFilters, setDisableFilters] = useState(false)

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return window.electronAPI.getDataSourceItems(
        {
          ...request,
          filters: disableFilters ? undefined : getRequestFilters(executionPlan) ?? request.filters,
        },
        executionPlan.dataSourceName,
      )
    },
    [disableFilters, executionPlan],
  )

  return (
    <Table
      columns={columns}
      keyProperty="id"
      data={dataFetcher}
      headerContent={
        <Box px="1rem">
          <FormControlLabel
            control={
              <Switch
                checked={disableFilters}
                onChange={(_, checked) => setDisableFilters(checked)}
                sx={{ my: '-0.5rem' }}
              />
            }
            label="Disable filters"
          />
        </Box>
      }
    />
  )
}

type FiltersType = Parameters<typeof window.electronAPI.getDataSourceItems>[0]['filters']
function getRequestFilters(
  executionPlan: ExecutionPlanRowsPreviewProps['executionPlan'],
): FiltersType {
  switch (executionPlan.type) {
    case RoutineExecutionType.MATCH_SEQUENTIALLY:
      return dataSourceFiltersToSqlite(executionPlan.filters)
    case RoutineExecutionType.SPECIFIC_IDS:
      return [
        {
          id: {
            in: executionPlan.ids,
          },
        },
      ]
    case RoutineExecutionType.EXCEPT_SPECIFIC_IDS:
      return [
        {
          id: {
            notIn: executionPlan.ids,
          },
        },
      ]
  }
}
