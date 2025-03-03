// import {
//   dataSourceQueryRegex,
//   ElectronToRendererMessage,
//   ErrorCode,
//   isCustomValueQuery,
//   ValueQueryType,
//   type ApiError,
//   parseScrapperStringValue,
// } from '@web-scraper/common'

// import type { RequestDataCallback, RequestDataSourceItemIdCallback } from '../../../scraper'
// import { broadcastMessageWithResponseRequest } from '../helpers'

// export const onManualDataRequest: RequestDataCallback = async (valueQuery, actionStep) => {
//   if (isCustomValueQuery(valueQuery)) {
//     return parseScrapperStringValue(
//       valueQuery.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), ''),
//     )
//   }

//   const [value] = await broadcastMessageWithResponseRequest(
//     ElectronToRendererMessage.requestManualDataForActionStep,
//     actionStep,
//     valueQuery,
//   )
//   return value
// }

// export const onManualDataSourceItemIdRequest: RequestDataSourceItemIdCallback = async (
//   dataSourceValueQuery,
//   actionStep,
// ) => {
//   if (!dataSourceValueQuery.match(dataSourceQueryRegex)) {
//     throw {
//       errorCode: ErrorCode.INCORRECT_DATA,
//       error: `"${dataSourceValueQuery}" is not a proper data source query`,
//     } satisfies ApiError
//   }

//   const [value] = await broadcastMessageWithResponseRequest(
//     ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
//     actionStep,
//     dataSourceValueQuery,
//   )
//   return value
// }
