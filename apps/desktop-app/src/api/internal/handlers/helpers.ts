import {
  ElectronToRendererMessage,
  ValueQueryType,
  dataSourceQueryRegex,
  isCustomValueQuery,
} from '@web-scraper/common'

import { type RequestDataCallback, type RequestDataSourceItemIdCallback } from '../../../scraper'
import { broadcastMessageWithResponseRequest } from '../helpers'

export const onManualDataRequest: RequestDataCallback = async (valueQuery, actionStep) => {
  if (isCustomValueQuery(valueQuery)) {
    return valueQuery.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), '')
  }

  const [value] = await broadcastMessageWithResponseRequest(
    ElectronToRendererMessage.requestManualDataForActionStep,
    actionStep,
    valueQuery,
  )
  return value
}

export const onManualDataSourceItemIdRequest: RequestDataSourceItemIdCallback = async (
  dataSourceValueQuery,
  actionStep,
) => {
  if (!dataSourceValueQuery.match(dataSourceQueryRegex)) {
    return null
  }

  const [value] = await broadcastMessageWithResponseRequest(
    ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
    actionStep,
    dataSourceValueQuery,
  )
  return value
}
