import { type DataSourceStructure } from '@web-scraper/common'

import { type getDataSources } from '../../../database/dataSource'

export function parseDatabaseDataSource(
  dataSource: Awaited<ReturnType<typeof getDataSources>>[number],
): DataSourceStructure {
  return {
    ...dataSource,
    name: dataSource.name.replace(/^DataSource\./, ''),
    columns: dataSource.columns.filter((column) => column.name !== 'id'),
  }
}
