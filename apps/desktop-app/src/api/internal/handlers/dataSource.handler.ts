import { type RequestHandlersSchema } from '../helpers'

export const dataSourceHandler = {
  // [RendererToElectronMessage.getDataSources]: handleApiRequest(
  //   RendererToElectronMessage.getDataSources,
  //   () =>
  //     Database.dataSource.getDataSources().then((sources) => sources.map(parseDatabaseDataSource)),
  // ),
  // [RendererToElectronMessage.deleteDataSource]: handleApiRequest(
  //   RendererToElectronMessage.deleteDataSource,
  //   (name) => Database.dataSource.deleteDataSource(name).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.updateDataSource]: handleApiRequest(
  //   RendererToElectronMessage.updateDataSource,
  //   (originalName, data) =>
  //     Database.dataSource.updateDataSource(originalName, data).then(parseDatabaseDataSource),
  // ),
  // [RendererToElectronMessage.createDataSource]: handleApiRequest(
  //   RendererToElectronMessage.createDataSource,
  //   (data) => Database.dataSource.createDataSource(data).then(parseDatabaseDataSource),
  // ),
  // [RendererToElectronMessage.deleteDataSourceItem]: handleApiRequest(
  //   RendererToElectronMessage.deleteDataSourceItem,
  //   (dataSourceName, itemId) =>
  //     Database.dataSource.deleteDataSourceItem(dataSourceName, itemId).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.updateDataSourceItem]: handleApiRequest(
  //   RendererToElectronMessage.updateDataSourceItem,
  //   (dataSourceName, itemId, data) =>
  //     Database.dataSource
  //       .updateDataSourceItem(dataSourceName, itemId, data)
  //       .then(parseDatabaseDataSourceItem),
  // ),
  // [RendererToElectronMessage.createDataSourceItem]: handleApiRequest(
  //   RendererToElectronMessage.createDataSourceItem,
  //   (dataSourceName, data) =>
  //     Database.dataSource.createDataSourceItem(dataSourceName, data).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.getDataSourceItems]: handleApiRequest(
  //   RendererToElectronMessage.getDataSourceItems,
  //   (request, dataSourceName) =>
  //     Database.dataSource.getDataSourceItems(request, dataSourceName).then((rawItems) => {
  //       const items = rawItems.map(parseDatabaseDataSourceItem)
  //       return {
  //         data: items,
  //         cursor: Database.utils.extractCursor(items, 'id', request.count),
  //       }
  //     }),
  // ),
  // [RendererToElectronMessage.clearDataSourceItems]: handleApiRequest(
  //   RendererToElectronMessage.clearDataSourceItems,
  //   (dataSourceName) =>
  //     Database.dataSource.clearDataSourceItems(dataSourceName).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.exportDataSourceItems]: handleApiRequest(
  //   RendererToElectronMessage.exportDataSourceItems,
  //   (dataSourceName) =>
  //     Database.dataSource.getAllDataSourceItems(dataSourceName).then((rawItems) =>
  //       saveAsFile(
  //         {
  //           filters: jsonFilters,
  //           defaultPath: `${encodeURI(dataSourceName.replace(/\./g, '-'))}.json`,
  //         },
  //         JSON.stringify(rawItems),
  //         'utf-8',
  //       ).then((res) => {
  //         if (res.errorCode !== ErrorCode.NO_ERROR) {
  //           return res
  //         }
  //         return { exportedRowsCount: rawItems.length }
  //       }),
  //     ),
  // ),
  // [RendererToElectronMessage.importDataSourceItems]: handleApiRequest(
  //   RendererToElectronMessage.importDataSourceItems,
  //   (dataSourceName) =>
  //     loadFile(
  //       {
  //         filters: jsonFilters,
  //         defaultPath: `${encodeURI(dataSourceName.replace(/\./g, '-'))}.json`,
  //       },
  //       'utf-8',
  //     ).then(async (fileResult) => {
  //       if ('errorCode' in fileResult) {
  //         return fileResult
  //       }
  //       const rawItems: RawDataSourceItemSchema[] = JSON.parse(fileResult.data)
  //       return Database.dataSource
  //         .insertRawDataSourceItems(dataSourceName, rawItems)
  //         .then((affectedRowsCount) => ({
  //           importedRowsCount: affectedRowsCount,
  //           failedRowsCount: rawItems.length - affectedRowsCount,
  //         }))
  //     }),
  // ),
} satisfies Partial<RequestHandlersSchema>

// const jsonFilters: FileFilter[] = [
//   {
//     name: 'Java Script Object Notation (JSON)',
//     extensions: ['json'],
//   },
// ]
