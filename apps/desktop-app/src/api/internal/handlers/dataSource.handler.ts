import { type DataSourceItem, RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseDatabaseDataSource } from '../parsers/dataSourceParser'

export const dataSourceHandler = {
  [RendererToElectronMessage.getDataSources]: handleApiRequest(
    RendererToElectronMessage.getDataSources,
    () =>
      Database.dataSource.getDataSources().then((sources) => sources.map(parseDatabaseDataSource)),
  ),
  [RendererToElectronMessage.deleteDataSource]: handleApiRequest(
    RendererToElectronMessage.deleteDataSource,
    (name) => Database.dataSource.deleteDataSource(name).then(() => successResponse),
  ),
  [RendererToElectronMessage.updateDataSource]: handleApiRequest(
    RendererToElectronMessage.updateDataSource,
    (originalName, data) =>
      Database.dataSource.updateDataSource(originalName, data).then(parseDatabaseDataSource),
  ),
  [RendererToElectronMessage.createDataSource]: handleApiRequest(
    RendererToElectronMessage.createDataSource,
    (data) => Database.dataSource.createDataSource(data).then(parseDatabaseDataSource),
  ),
  [RendererToElectronMessage.getDataSourceItems]: handleApiRequest(
    RendererToElectronMessage.getDataSourceItems,
    (request) =>
      Database.dataSource.getDataSourceItems(request).then((rows) => {
        console.log(rows) //TODO

        return {
          data: rows as DataSourceItem[],
          cursor: Database.utils.extractCursor(rows, 'id', request.count),
        }
      }),
  ),
} satisfies Partial<RequestHandlersSchema>
