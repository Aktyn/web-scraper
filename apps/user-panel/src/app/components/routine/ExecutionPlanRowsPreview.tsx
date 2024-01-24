import { useCallback, useContext } from 'react'
import { RoutineExecutionType, dataSourceFiltersToSqlite, type Routine } from '@web-scraper/common'
import { DataSourcesContext } from 'src/app/context/dataSourcesContext'
import { useDataSourceTableColumns } from 'src/app/hooks/useDataSourceTableColumns'
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

  const dataFetcher = useCallback<typeof window.electronAPI.getDataSourceItems>(
    (request) => {
      return window.electronAPI.getDataSourceItems(
        { ...request, filters: getRequestFilters(executionPlan) ?? request.filters },
        executionPlan.dataSourceName,
      )
    },
    [executionPlan],
  )

  return <Table columns={columns} keyProperty="id" hideRefreshButton data={dataFetcher} />
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
