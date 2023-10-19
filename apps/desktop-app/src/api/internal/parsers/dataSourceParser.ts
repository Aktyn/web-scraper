import { type DataSourceItem, type DataSourceStructure } from '@web-scraper/common'

import { type getDataSourceItems, type getDataSources } from '../../../database/dataSource'

export function parseDatabaseDataSource(
  rawDataSource: Awaited<ReturnType<typeof getDataSources>>[number],
): DataSourceStructure {
  return {
    ...rawDataSource,
    name: rawDataSource.name.replace(/^DataSource\./, ''),
    columns: rawDataSource.columns.filter((column) => column.name.toLowerCase() !== 'id'),
  }
}

export function parseDatabaseDataSourceItem(
  rawDataSourceItem: Awaited<ReturnType<typeof getDataSourceItems>>[number],
): DataSourceItem {
  return {
    id: rawDataSourceItem.id,
    data: Object.entries(rawDataSourceItem).reduce(
      (acc, [columnName, value]) => {
        if (columnName.toLowerCase() !== 'id') {
          acc.push({ columnName, value: value ?? null })
        }
        return acc
      },
      [] as DataSourceItem['data'],
    ),
  }
}
