import {
  type ActionStep,
  ActionStepErrorType,
  type ActionStepType,
  DataSourceColumnType,
  dataSourceQueryRegex,
  float,
  int,
  SaveDataType,
  type ScraperMode,
} from '@web-scraper/common'

import Database from '../../database'
import { type RequestDataSourceItemIdCallback } from '../helpers'
import type { Scraper } from '../scraper'

export async function saveToDataSourceStep<ModeType extends ScraperMode>(
  this: Scraper<ModeType>,
  actionStep: ActionStep & { type: ActionStepType.SAVE_TO_DATA_SOURCE },
  requestDataSourceItemId: RequestDataSourceItemIdCallback,
) {
  if (!actionStep.data.dataSourceQuery.match(dataSourceQueryRegex)) {
    return {
      errorType: ActionStepErrorType.INCORRECT_DATA,
      content: "dataSourceQuery doesn't match regex",
    }
  }

  const [dataSourceName, dataSourceColumn] = actionStep.data.dataSourceQuery
    .split('.')
    .slice(1) ?? ['', '']

  const dataSource = await Database.dataSource.getDataSource(dataSourceName)
  if (!dataSource) {
    return {
      errorType: ActionStepErrorType.DATA_SOURCE_NOT_FOUND,
      content: `${dataSourceName} not found as data source`,
    }
  }

  const column = dataSource.columns.find((column) => column.name === dataSourceColumn)
  if (!column) {
    return {
      errorType: ActionStepErrorType.DATA_SOURCE_COLUMN_NOT_FOUND,
      content: `${dataSourceColumn} not found as data source column`,
    }
  }

  const dataSourceItemId = await requestDataSourceItemId(
    actionStep.data.dataSourceQuery,
    actionStep,
  )
  if (!dataSourceItemId) {
    //TODO: support inserting new rows when dataSourceItemId is null
    return {
      errorType: ActionStepErrorType.UNKNOWN,
    }
  }

  const setColumnValue = (value: string | number | null) =>
    Database.dataSource.updateDataSourceItemColumn(
      dataSourceName,
      dataSourceItemId,
      dataSourceColumn,
      value,
    )

  switch (actionStep.data.saveDataType) {
    case SaveDataType.ELEMENT_CONTENT:
      {
        const inputHandle = await this.waitFor(actionStep.data.saveToDataSourceValue ?? '')
        if (!inputHandle) {
          return { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND }
        }
        const textContent = await inputHandle.evaluate((el) => el.textContent)
        switch (column.type) {
          case DataSourceColumnType.TEXT:
            await setColumnValue(textContent)
            break
          case DataSourceColumnType.INTEGER:
            if (!textContent) {
              await setColumnValue(null)
            } else {
              await setColumnValue(int(textContent.replace(/[^\d.]/g, '')))
            }
            break
          case DataSourceColumnType.REAL:
            if (!textContent) {
              await setColumnValue(null)
            } else {
              await setColumnValue(float(textContent.replace(/[^\d.]/g, '')))
            }
            break
        }
      }
      break
    case SaveDataType.CUSTOM:
      await Database.dataSource.updateDataSourceItemColumn(
        dataSourceName,
        dataSourceItemId,
        dataSourceColumn,
        actionStep.data.saveToDataSourceValue ?? null,
      )
      break
    case SaveDataType.SET_NULL:
      await Database.dataSource.updateDataSourceItemColumn(
        dataSourceName,
        dataSourceItemId,
        dataSourceColumn,
        null,
      )
      break
    case SaveDataType.CURRENT_TIMESTAMP:
      await Database.dataSource.updateDataSourceItemColumn(
        dataSourceName,
        dataSourceItemId,
        dataSourceColumn,
        column.type === DataSourceColumnType.TEXT
          ? new Date().toISOString()
          : int(Date.now() / 1000),
      )
      break
  }

  return { errorType: ActionStepErrorType.NO_ERROR }
}
