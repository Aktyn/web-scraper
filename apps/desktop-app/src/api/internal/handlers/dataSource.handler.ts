import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseDatabaseDataSource, parseDatabaseDataSourceItem } from '../parsers/dataSourceParser'

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
    (request, dataSourceName) =>
      Database.dataSource
        .getDataSourceItems(request, dataSourceName)
        .then((rawItems) => rawItems.map(parseDatabaseDataSourceItem))
        .then((items) => ({
          data: items,
          cursor: Database.utils.extractCursor(items, 'id', request.count),
        })),
  ),
  [RendererToElectronMessage.deleteDataSourceItem]: handleApiRequest(
    RendererToElectronMessage.deleteDataSourceItem,
    (dataSourceName, itemId) =>
      Database.dataSource.deleteDataSourceItem(dataSourceName, itemId).then(() => successResponse),
  ),
  [RendererToElectronMessage.updateDataSourceItem]: handleApiRequest(
    RendererToElectronMessage.updateDataSourceItem,
    (dataSourceName, itemId, data) =>
      Database.dataSource
        .updateDataSourceItem(dataSourceName, itemId, data)
        .then(parseDatabaseDataSourceItem),
  ),
  [RendererToElectronMessage.createDataSourceItem]: handleApiRequest(
    RendererToElectronMessage.createDataSourceItem,
    (dataSourceName, data) =>
      Database.dataSource.createDataSourceItem(dataSourceName, data).then(() => successResponse),
  ),
} satisfies Partial<RequestHandlersSchema>
